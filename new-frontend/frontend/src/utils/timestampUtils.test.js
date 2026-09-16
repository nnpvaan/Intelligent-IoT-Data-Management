import { describe, expect, it } from 'vitest';
import {
  normaliseTimestamp,
  normaliseApiRecords,
} from './timestampUtils.js';

describe('normaliseTimestamp', () => {
  it('normalises a valid timestamp to UTC ISO format', () => {
    expect(normaliseTimestamp('2026-09-08T10:30:00Z')).toBe(
      '2026-09-08T10:30:00.000Z'
    );
  });

  it('converts a timestamp with an offset to UTC', () => {
    expect(normaliseTimestamp('2026-09-08T20:30:00+10:00')).toBe(
      '2026-09-08T10:30:00.000Z'
    );
  });

  it('returns null for an invalid timestamp', () => {
    expect(normaliseTimestamp('invalid-date')).toBeNull();
  });

  it('returns null for a missing timestamp', () => {
    expect(normaliseTimestamp(null)).toBeNull();
  });
});

describe('normaliseApiRecords', () => {
  it('normalises and sorts API records', () => {
    const records = [
      {
        entry_id: 2,
        created_at: '2026-09-08T11:30:00Z',
        field1: '20',
      },
      {
        entry_id: 1,
        created_at: '2026-09-08T10:30:00Z',
        field1: '10',
      },
    ];

    const result = normaliseApiRecords(records);

    expect(result).toHaveLength(2);
    expect(result[0].entry_id).toBe(1);
    expect(result[0].created_at).toBe('2026-09-08T10:30:00.000Z');
  });

  it('removes records with invalid timestamps', () => {
    const records = [
      { entry_id: 1, created_at: 'invalid-date' },
      { entry_id: 2, created_at: '2026-09-08T10:30:00Z' },
    ];

    const result = normaliseApiRecords(records);

    expect(result).toHaveLength(1);
    expect(result[0].entry_id).toBe(2);
  });

  it('returns an empty array for invalid API data', () => {
    expect(normaliseApiRecords(null)).toEqual([]);
  });
});