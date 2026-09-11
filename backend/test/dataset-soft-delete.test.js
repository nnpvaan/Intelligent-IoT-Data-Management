const test = require("node:test");
const assert = require("node:assert/strict");
const db = require("../src/db/pool");
const datasetRepository = require("../src/repositories/datasetRepository");

test("findAll(active) excludes soft-deleted datasets", async () => {
  const originalQuery = db.query;
  let capturedSql;
  db.query = async (sql) => {
    capturedSql = sql;
    return { rows: [{ id: 1, name: "active-one", totalRows: 5 }] };
  };
  try {
    const rows = await datasetRepository.findAll("active");
    assert.match(capturedSql, /d\.deleted_at IS NULL/);
    assert.equal(rows.length, 1);
  } finally {
    db.query = originalQuery;
  }
});

test("findAll(deleted) only returns non-expired deleted datasets and adds remainingRecoveryDays", async () => {
  const originalQuery = db.query;
  db.query = async () => ({
    rows: [
      {
        id: 2,
        name: "deleted-one",
        totalRows: 3,
        deletedAt: new Date().toISOString(),
        recoveryExpiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
      },
    ],
  });
  try {
    const rows = await datasetRepository.findAll("deleted");
    assert.equal(rows[0].remainingRecoveryDays, 5);
  } finally {
    db.query = originalQuery;
  }
});

test("getDatasetIdByName excludes soft-deleted datasets", async () => {
  const originalQuery = db.query;
  let capturedSql;
  const timeseriesRepository =
    new (require("../src/repositories/timeseriesRepository"))();
  db.query = async (sql) => {
    capturedSql = sql;
    return { rows: [] };
  };
  try {
    const id = await timeseriesRepository.getDatasetIdByName("deleted-dataset");
    assert.match(capturedSql, /deleted_at IS NULL/);
    assert.equal(id, null);
  } finally {
    db.query = originalQuery;
  }
});
