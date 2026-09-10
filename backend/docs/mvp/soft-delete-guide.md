# Soft-Delete Implementation for Datasets

## Overview

The datasets table now supports soft-delete, allowing a 15-day recovery period before permanent deletion.

## How It Works

### Active Dataset
- `deleted_at` is NULL
- `deleted_by` is NULL
- Dataset name is unique (no duplicates)

### Soft-Deleted Dataset
- `deleted_at` contains the deletion timestamp
- `deleted_by` contains who deleted it (username/ID)
- Data is preserved for 15 days
- Name can be reused after 15 days

### Expired Dataset
- `deleted_at` is older than 15 days
- Can be permanently purged via cleanup job
- Related timeseries data can be archived

## Common Queries

### Find all active datasets
```sql
SELECT * FROM datasets WHERE deleted_at IS NULL;
```

### Find all soft-deleted datasets
```sql
SELECT * FROM datasets WHERE deleted_at IS NOT NULL;
```

### Find datasets eligible for permanent deletion (>15 days)
```sql
SELECT * FROM datasets 
WHERE deleted_at IS NOT NULL 
AND deleted_at < NOW() - INTERVAL '15 days';
```

### Soft-delete a dataset
```sql
UPDATE datasets 
SET deleted_at = NOW(), deleted_by = 'username'
WHERE id = 1;
```

### Restore a soft-deleted dataset
```sql
UPDATE datasets 
SET deleted_at = NULL, deleted_by = NULL
WHERE id = 1;
```

## Field Mappings

Field mappings remain linked to soft-deleted datasets via foreign key relationship. They are not automatically deleted when a dataset is soft-deleted, allowing recovery if the dataset is restored within 15 days.

## Indexes for Performance

- `idx_datasets_name_active`: Ensures unique names for active datasets only
- `idx_datasets_deleted_at`: Enables efficient queries for deleted/expired datasets

## Migration

Migration script: `src/db/migrations/001_add_soft_delete.sql`
Applied to existing database to add soft-delete columns and indexes.
