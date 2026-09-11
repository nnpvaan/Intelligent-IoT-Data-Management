const test = require('node:test');
const assert = require('node:assert/strict');

const {
  normaliseInputTimestamp,
  serialiseUtcTimestamp
} = require('../src/utils/timestampUtils');

const TimeSeriesWide = require('../src/models/timeSeriesWide');

test('accepts a valid UTC timestamp', () => {
  assert.equal(
    normaliseInputTimestamp('2026-09-10T10:30:00Z'),
    '2026-09-10T10:30:00.000Z'
  );
});

test('accepts a valid timestamp with an offset', () => {
  assert.equal(
    normaliseInputTimestamp('2026-09-10T20:30:00+10:00'),
    '2026-09-10T10:30:00.000Z'
  );
});

test('equivalent timestamps become the same UTC instant', () => {
  assert.equal(
    normaliseInputTimestamp('2026-09-10T10:30:00Z'),
    normaliseInputTimestamp('2026-09-10T20:30:00+10:00')
  );
});

test('rejects a timezone-less timestamp', () => {
  assert.throws(
    () => normaliseInputTimestamp('2026-09-10T10:30:00'),
    /ISO 8601/
  );
});

test('rejects an invalid timestamp', () => {
  assert.throws(
    () => normaliseInputTimestamp('invalid-timestamp'),
    /ISO 8601/
  );
});

test('rejects a missing timestamp', () => {
  assert.throws(
    () => normaliseInputTimestamp(undefined),
    /ISO 8601/
  );
});

test('serialises database timestamps as UTC', () => {
  assert.equal(
    serialiseUtcTimestamp(new Date('2026-09-10T20:30:00+10:00')),
    '2026-09-10T10:30:00.000Z'
  );
});

test('API model returns created_at in UTC', () => {
  const row = new TimeSeriesWide({
    dataset_id: 1,
    created_at: new Date('2026-09-10T20:30:00+10:00'),
    entry_id: 1,
    field1: 25.4
  });

  assert.equal(row.created_at, '2026-09-10T10:30:00.000Z');
});