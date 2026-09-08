export const normaliseTimestamp = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

export const normaliseApiRecords = (records) => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map((record) => {
      const timestamp = normaliseTimestamp(
        record.created_at ?? record.timestamp ?? record.createdAt
      );

      if (!timestamp) {
        return null;
      }

      return {
        ...record,
        created_at: timestamp,
      };
    })
    .filter(Boolean)
    .sort(
      (first, second) =>
        new Date(first.created_at).getTime() -
        new Date(second.created_at).getTime()
    );
};