const ISO_8601_WITH_TIMEZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i;

/**
 * Validates an incoming API/ingestion timestamp and converts it to UTC.
 * Only ISO 8601 timestamps with Z or an explicit offset are accepted.
 */
function normaliseInputTimestamp(value) {
  if (typeof value !== 'string' || !ISO_8601_WITH_TIMEZONE.test(value)) {
    throw new TypeError(
      'Timestamp must be ISO 8601 with Z or an explicit timezone offset'
    );
  }

  const milliseconds = Date.parse(value);

  if (Number.isNaN(milliseconds)) {
    throw new TypeError('Timestamp is invalid');
  }

  return new Date(milliseconds).toISOString();
}

/**
 * Serialises a database timestamp as an ISO 8601 UTC string.
 */
function serialiseUtcTimestamp(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError('Stored timestamp is invalid');
  }

  return date.toISOString();
}

module.exports = {
  normaliseInputTimestamp,
  serialiseUtcTimestamp
};