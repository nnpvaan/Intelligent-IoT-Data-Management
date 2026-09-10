const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5432,
  database: 'IoTDatabase',
});

describe('Soft-Delete Functionality', () => {
  
  beforeAll(async () => {
    await pool.query('DELETE FROM timeseries WHERE TRUE');
    await pool.query('DELETE FROM timeseries_long WHERE TRUE');
    await pool.query('DELETE FROM datasets WHERE TRUE');
  });

  afterAll(async () => {
    await pool.end();
  });

  test('Active dataset has NULL deleted_at and deleted_by', async () => {
    const result = await pool.query(
      'INSERT INTO datasets (name) VALUES ($1) RETURNING *',
      ['test-dataset-1']
    );
    
    expect(result.rows[0].deleted_at).toBeNull();
    expect(result.rows[0].deleted_by).toBeNull();
  });

  test('Soft-delete sets deleted_at and deleted_by', async () => {
    await pool.query(
      'INSERT INTO datasets (name) VALUES ($1)',
      ['test-dataset-2']
    );
    
    const deleteResult = await pool.query(
      "UPDATE datasets SET deleted_at = NOW(), deleted_by = 'testuser' WHERE name = $1 RETURNING *",
      ['test-dataset-2']
    );
    
    expect(deleteResult.rows[0].deleted_at).not.toBeNull();
    expect(deleteResult.rows[0].deleted_by).toBe('testuser');
  });

  test('Active datasets query excludes soft-deleted', async () => {
    await pool.query('INSERT INTO datasets (name) VALUES ($1)', ['active-1']);
    await pool.query(
      "INSERT INTO datasets (name, deleted_at, deleted_by) VALUES ($1, NOW(), $2)",
      ['deleted-1', 'testuser']
    );
    
    const result = await pool.query('SELECT * FROM datasets WHERE deleted_at IS NULL');
    
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.find(r => r.name === 'active-1')).toBeDefined();
    expect(result.rows.find(r => r.name === 'deleted-1')).toBeUndefined();
  });

  test('Name can be reused after soft-deletion', async () => {
    const name = 'reusable-name';
    
    // Create first dataset
    await pool.query('INSERT INTO datasets (name) VALUES ($1)', [name]);
    
    // Soft-delete it
    await pool.query(
      "UPDATE datasets SET deleted_at = NOW(), deleted_by = 'testuser' WHERE name = $1",
      [name]
    );
    
    // Should be able to create new active dataset with same name
    const result = await pool.query(
      'INSERT INTO datasets (name) VALUES ($1) RETURNING *',
      [name]
    );
    
    expect(result.rows[0].name).toBe(name);
    expect(result.rows[0].deleted_at).toBeNull();
  });

  test('Find expired datasets (>15 days old)', async () => {
    // Insert dataset deleted 20 days ago
    await pool.query(
      "INSERT INTO datasets (name, deleted_at, deleted_by) VALUES ($1, NOW() - INTERVAL '20 days', $2)",
      ['expired-dataset', 'testuser']
    );
    
    // Insert dataset deleted 5 days ago
    await pool.query(
      "INSERT INTO datasets (name, deleted_at, deleted_by) VALUES ($1, NOW() - INTERVAL '5 days', $2)",
      ['recent-delete', 'testuser']
    );
    
    const result = await pool.query(
      "SELECT * FROM datasets WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '15 days'"
    );
    
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows.find(r => r.name === 'expired-dataset')).toBeDefined();
    expect(result.rows.find(r => r.name === 'recent-delete')).toBeUndefined();
  });

  test('Field mappings remain linked to soft-deleted dataset', async () => {
    // Create dataset
    const datasetResult = await pool.query(
      'INSERT INTO datasets (name) VALUES ($1) RETURNING id',
      ['mapping-test-dataset']
    );
    const datasetId = datasetResult.rows[0].id;
    
    // Insert timeseries data for this dataset
    await pool.query(
      'INSERT INTO timeseries (dataset_id, created_at, entry_id, field1) VALUES ($1, NOW(), $2, $3)',
      [datasetId, 1, 25.5]
    );
    
    // Soft-delete the dataset
    await pool.query(
      "UPDATE datasets SET deleted_at = NOW(), deleted_by = 'testuser' WHERE id = $1",
      [datasetId]
    );
    
    // Verify timeseries data still exists and links to soft-deleted dataset
    const result = await pool.query(
      'SELECT t.*, d.deleted_at FROM timeseries t JOIN datasets d ON t.dataset_id = d.id WHERE d.id = $1',
      [datasetId]
    );
    
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].deleted_at).not.toBeNull();
  });

  test('Restore soft-deleted dataset', async () => {
    const name = 'restore-test';
    
    // Create and soft-delete
    await pool.query('INSERT INTO datasets (name) VALUES ($1)', [name]);
    await pool.query(
      "UPDATE datasets SET deleted_at = NOW(), deleted_by = 'testuser' WHERE name = $1",
      [name]
    );
    
    // Restore
    const result = await pool.query(
      'UPDATE datasets SET deleted_at = NULL, deleted_by = NULL WHERE name = $1 RETURNING *',
      [name]
    );
    
    expect(result.rows[0].deleted_at).toBeNull();
    expect(result.rows[0].deleted_by).toBeNull();
  });

});
