import 'dotenv/config';
import { randomBytes } from 'node:crypto';
import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../src/app.js';
import { Feedback } from '../src/models/Feedback.js';
import { graded, printReport } from './rubric.js';

const BASE = '/api/feedback';
const REQUEST_TIMEOUT_MS = 5000;

// Each run uses its own throwaway database on the MONGO_URI cluster and drops
// it afterwards, so parallel runs never touch each other's data.
const RUN_DB = `grade_${process.env.GITHUB_RUN_ID || 'local'}_${Date.now()}_${randomBytes(3).toString('hex')}`;

beforeAll(async () => {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is not set (see README "Database connection")');
  await mongoose.connect(process.env.MONGO_URI, { dbName: RUN_DB, autoIndex: true });
  await Feedback.init();
}, 60000);

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  printReport();
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase().catch(() => {});
  }
  await mongoose.disconnect();
});

// ---------- helpers ----------

const api = {
  get: (path) => request(app).get(path).timeout(REQUEST_TIMEOUT_MS),
  post: (path, body) => request(app).post(path).send(body).timeout(REQUEST_TIMEOUT_MS),
  patch: (path, body) => request(app).patch(path).send(body).timeout(REQUEST_TIMEOUT_MS),
  delete: (path) => request(app).delete(path).timeout(REQUEST_TIMEOUT_MS)
};

const newId = () => new mongoose.Types.ObjectId().toString();
const idOf = (doc) => String(doc?._id ?? doc?.id);

function seed(overrides = {}) {
  return Feedback.create({
    eventCode: 'EV101',
    score: 4,
    comment: 'Seeded entry',
    submittedBy: newId(),
    ...overrides
  });
}

function numericOption(path, key) {
  const value = path?.options?.[key];
  return Array.isArray(value) ? value[0] : value;
}

// ---------- graded checks ----------

graded(1, async () => {
  const schema = Feedback.schema;
  const own = Object.keys(schema.paths)
    .filter((p) => !['_id', '__v', 'createdAt', 'updatedAt'].includes(p))
    .sort();
  expect(own).toEqual(['eventCode', 'score', 'comment', 'submittedBy'].sort());

  const code = schema.path('eventCode');
  expect(code.instance).toBe('String');
  expect(code.isRequired).toBe(true);

  const value = schema.path('score');
  expect(value.instance).toBe('Number');
  expect(value.isRequired).toBe(true);
  expect(numericOption(value, 'min')).toBe(1);
  expect(numericOption(value, 'max')).toBe(5);

  const text = schema.path('comment');
  expect(text.instance).toBe('String');
  expect(Boolean(text.isRequired)).toBe(false);

  const ref = schema.path('submittedBy');
  expect(ref.instance).toBe('ObjectId');
  expect(ref.options.ref).toBe('User');
  expect(Boolean(ref.isRequired)).toBe(false);
});

graded(2, async () => {
  const schema = Feedback.schema;
  expect(schema.path('createdAt')).toBeDefined();
  expect(schema.path('updatedAt')).toBeDefined();

  const compoundUnique = schema
    .indexes()
    .filter(([fields, options]) => Object.keys(fields).length > 1 && options?.unique === true);
  expect(compoundUnique).toHaveLength(1);
  expect(compoundUnique[0][0]).toEqual({ eventCode: 1, submittedBy: 1 });
});

graded(3, async () => {
  const invalidValues = [0, 6, 3.5, 'abc'];
  for (const bad of invalidValues) {
    const res = await api.post(BASE, { eventCode: 'EV101', score: bad });
    expect(res.status).toBe(400);
    expect(typeof res.body.message).toBe('string');
  }

  const missingCode = await api.post(BASE, { score: 3 });
  expect(missingCode.status).toBe(400);
  expect(typeof missingCode.body.message).toBe('string');

  const missingValue = await api.post(BASE, { eventCode: 'EV101' });
  expect(missingValue.status).toBe(400);
  expect(typeof missingValue.body.message).toBe('string');

  expect(await Feedback.countDocuments()).toBe(0);
});

graded(4, async () => {
  const payload = {
    eventCode: 'EV101',
    score: 4,
    comment: 'Clear and useful',
    submittedBy: newId()
  };
  const res = await api.post(BASE, payload);
  expect(res.status).toBe(201);
  expect(res.body.feedback).toBeDefined();
  expect(res.body.feedback.eventCode).toBe('EV101');
  expect(res.body.feedback.score).toBe(4);

  const stored = await Feedback.findById(idOf(res.body.feedback)).lean();
  expect(stored).not.toBeNull();
  expect(stored.eventCode).toBe('EV101');
  expect(stored.score).toBe(4);
  expect(stored.comment).toBe('Clear and useful');
  expect(String(stored.submittedBy)).toBe(payload.submittedBy);
});

graded(5, async () => {
  const a = await seed({ score: 5 });
  const b = await seed({ eventCode: 'EV202', score: 2 });

  const res = await api.get(BASE);
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body.feedbacks)).toBe(true);
  expect(res.body.feedbacks).toHaveLength(2);
  const ids = res.body.feedbacks.map(idOf).sort();
  expect(ids).toEqual([a._id.toString(), b._id.toString()].sort());
});

graded(6, async () => {
  const doc = await seed();

  const res = await api.get(`${BASE}/${doc._id}`);
  expect(res.status).toBe(200);
  expect(idOf(res.body.feedback)).toBe(doc._id.toString());
  expect(res.body.feedback.eventCode).toBe('EV101');

  const missing = await api.get(`${BASE}/${newId()}`);
  expect(missing.status).toBe(404);
  expect(missing.body).toEqual({ message: 'Feedback not found' });
});

graded(7, async () => {
  const doc = await seed({ score: 4 });

  const res = await api.patch(`${BASE}/${doc._id}`, { score: 2 });
  expect(res.status).toBe(200);
  expect(idOf(res.body.feedback)).toBe(doc._id.toString());
  expect(res.body.feedback.score).toBe(2);
  expect((await Feedback.findById(doc._id).lean()).score).toBe(2);

  const invalid = await api.patch(`${BASE}/${doc._id}`, { score: 9 });
  expect(invalid.status).toBe(400);
  expect((await Feedback.findById(doc._id).lean()).score).toBe(2);

  const missing = await api.patch(`${BASE}/${newId()}`, { score: 3 });
  expect(missing.status).toBe(404);
  expect(missing.body).toEqual({ message: 'Feedback not found' });
});

graded(8, async () => {
  const doc = await seed();

  const res = await api.delete(`${BASE}/${doc._id}`);
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
  expect(await Feedback.findById(doc._id)).toBeNull();

  const missing = await api.delete(`${BASE}/${newId()}`);
  expect(missing.status).toBe(404);
  expect(missing.body).toEqual({ message: 'Feedback not found' });
});

graded(9, async () => {
  await seed({ score: 5 });
  await seed({ score: 4 });
  await seed({ score: 3 });
  await seed({ eventCode: 'EV202', score: 1 });

  const spy = jest.spyOn(Feedback, 'aggregate');
  try {
    const res = await api.get(`${BASE}/summary?eventCode=EV101`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ eventCode: 'EV101', averageScore: 4, feedbackCount: 3 });
    expect(spy).toHaveBeenCalled();

    const empty = await api.get(`${BASE}/summary?eventCode=EV999`);
    expect(empty.status).toBe(200);
    expect(empty.body).toEqual({ eventCode: 'EV999', averageScore: 0, feedbackCount: 0 });
  } finally {
    spy.mockRestore();
  }
});

graded(10, async () => {
  const doc = await seed();
  const notFound = (res) => res.status === 404 && res.body?.message === 'Not Found';

  const summary = await api.get(`${BASE}/summary?eventCode=EV101`);
  expect(summary.status).toBe(200);
  expect(summary.body.eventCode).toBe('EV101');

  const noQuery = await api.get(`${BASE}/summary`);
  expect(noQuery.status).toBe(400);
  expect(noQuery.body).toEqual({ message: 'eventCode is required' });

  const unknown = await api.get('/api/this-route-does-not-exist');
  expect(unknown.status).toBe(404);

  const reachable = [
    await api.get(BASE),
    await api.get(`${BASE}/${doc._id}`),
    await api.post(BASE, { eventCode: 'EV202', score: 3, submittedBy: newId() }),
    await api.patch(`${BASE}/${doc._id}`, { score: 3 }),
    await api.delete(`${BASE}/${doc._id}`)
  ];
  for (const res of reachable) {
    expect(notFound(res)).toBe(false);
    expect(res.status).toBeLessThan(500);
  }
});
