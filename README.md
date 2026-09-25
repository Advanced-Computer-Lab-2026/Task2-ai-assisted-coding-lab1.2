# Task 1.2: Event Feedback API

You are building the backend for an event feedback service, using Express and MongoDB (Mongoose) only, with no frontend. Anyone can browse and submit event feedback, and there is no login for this resource.

## What's already done for you

- `server/src/index.js`, `server/src/app.js`, `server/src/config/db.js` —
  app bootstrap and DB connection. The `/api/feedback` router is already
  mounted in `app.js`.
- `server/src/models/User.js` — a plain user schema (`name`, `email`,
  `password`). It's not tied to any login flow here; it exists so
  `Feedback.submittedBy` has something to reference.
- `server/src/controllers/userController.js` + `server/src/routes/users.js`
  — full CRUD over users, already wired, as a worked example of what your
  `feedbackController.js` should look like structurally (validation → DB
  call → response, one function per route).

## Run locally

```
cd server
npm install
# create server/.env (see "Database connection" below)
npm run dev
npm test
```

`npm test` does not need your `.env` or any external database; it runs
against a temporary in-memory MongoDB.

## Database connection

There is no `.env` provided. Create `server/.env` yourself (it's
git-ignored) with:

```
PORT=4000
MONGO_URI=<your own MongoDB connection string>
```

Use your own MongoDB instance (local or Atlas). Never commit `.env` or any
credentials.

## What you need to build

All of your work goes in three files: `server/src/models/Feedback.js`,
`server/src/controllers/feedbackController.js` and
`server/src/routes/feedback.js`.

### 1. The `Feedback` model — `server/src/models/Feedback.js`

| field | type | rules |
|---|---|---|
| `eventCode` | String | required (e.g. `"EV101"`) |
| `score` | Number | required, integer, `min: 1`, `max: 5` |
| `comment` | String | optional |
| `submittedBy` | ObjectId ref `User` | optional |

Keep `{ timestamps: true }` and add a **compound unique index** on
`{ eventCode: 1, submittedBy: 1 }`.

### 2. Validation — inside `server/src/controllers/feedbackController.js`

Joi schemas for create and update.

- Create: `eventCode` required string; `score` required integer
  1–5; `comment` optional string; `submittedBy` optional.
- Update: the same fields, all optional. Validate with
  `{ abortEarly: false, stripUnknown: true }` and update with `$set`,
  `new: true` and `runValidators: true`.
- A validation failure responds `400` with `{ message: <Joi error message> }`.

### 3. Controller + routes

Implement the six exported controller functions and wire them in
`server/src/routes/feedback.js`:

| method | path | function | success response |
|---|---|---|---|
| GET | `/api/feedback` | `getAllFeedbacks` | `200` `{ feedbacks: [...] }` |
| GET | `/api/feedback/summary?eventCode=EV101` | `getFeedbackSummary` | `200` (see section 4) |
| GET | `/api/feedback/:id` | `getFeedback` | `200` `{ feedback: <document> }` |
| POST | `/api/feedback` | `createFeedback` | `201` `{ feedback: <document> }` |
| PATCH | `/api/feedback/:id` | `updateFeedback` | `200` `{ feedback: <updated document> }` |
| DELETE | `/api/feedback/:id` | `deleteFeedback` | `200` `{ ok: true }` |

- For GET/PATCH/DELETE on a valid id that does not exist, respond `404`
  with `{ message: 'Feedback not found' }`.
- Pass unexpected errors to `next(err)`, as the User controller does.
- `/summary` must be reachable and must not be handled by `/:id`.

### 4. The summary endpoint

`GET /api/feedback/summary?eventCode=EV101` returns:

```
{ "eventCode": "EV101", "averageScore": <number>, "feedbackCount": <integer> }
```

- Compute it with `Feedback.aggregate()`: `$match` on `eventCode`, then
  `$group` with `$avg` of `score` and `$sum: 1`. Loading documents
  with `find()` and averaging in JavaScript does not count.
- If nothing matches, return the requested `eventCode` with
  `averageScore: 0` and `feedbackCount: 0`.
- If the `eventCode` query parameter is missing, respond `400` with
  `{ message: 'eventCode is required' }`.

## Automated grading

`npm test` runs ten equally weighted functional checks (one point each) and
prints `Functional grade: X/10`. The tests in `server/tests/` are visible
and are the source of truth for the required behavior. The same tests run
in GitHub Actions on your pull request.

## Submission

1. Fork this repository and do all of your work in your fork.
2. Commit and push to your fork.
3. Open a pull request from your fork to `main` of this repository.
4. Fill in the pull request description using the provided template: the
   submission line must be your identifier in the format `XX-XXXXX TXX`.

The PR description format is checked separately and does not change your
functional grade.

## AI use

You're expected to use AI tools while building this. You remain
responsible for all of the code you submit.
