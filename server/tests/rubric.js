// Functional grading rubric: ten numbered checks, one point each.
// Every graded test in grade.test.js is registered through graded(), which
// records PASS/FAIL so the final report can print the X/10 grade.

export const RUBRIC = [
  'Model fields',
  'Schema options/index',
  'Validation',
  'Create',
  'Read all',
  'Read one',
  'Update',
  'Delete',
  'Aggregation',
  'Routing/integration'
];

export const TOTAL_POINTS = RUBRIC.length;

const results = new Map();

export function graded(number, fn) {
  const name = RUBRIC[number - 1];
  if (!name) throw new Error(`Unknown rubric item ${number}`);
  test(`[1 point] ${name}`, async () => {
    results.set(number, false);
    await fn();
    results.set(number, true);
  });
}

export function printReport() {
  const lines = RUBRIC.map((name, i) => {
    const passed = results.get(i + 1) === true;
    return `${passed ? 'PASS' : 'FAIL'} [1 point] ${name}`;
  });
  const score = RUBRIC.filter((_, i) => results.get(i + 1) === true).length;
  lines.push('', `Functional grade: ${score}/${TOTAL_POINTS}`);
  process.stdout.write(`\n${lines.join('\n')}\n\n`);
  return score;
}
