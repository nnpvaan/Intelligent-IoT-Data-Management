const express = require('express');
const router = express.Router();

const {
  getAllDatasets,
  getDatasetById,
  createDataset,
  updateDataset,
<<<<<<< HEAD
=======
  deleteDataset,
  restoreDataset,
>>>>>>> 5c5855ebf2c866c6f18f3809753f78e18e71beba
} = require('../controllers/datasetsController');
const authMiddleware = require('../middleware/authMiddleware');

// TODO(FE auth migration): Reapply authMiddleware to these read routes after
// the frontend sends Bearer tokens for dataset reads. It must keep `dataset.id`
// (not `dataset.name`) as the dashboard route value at the same time.
// GET /api/datasets
router.get(
  '/datasets',
  (req, res, next) => {
    if (req.query.status === 'deleted') {
      return authMiddleware(req, res, next);
    }

    return next();
  },
  getAllDatasets,
);

// GET /api/datasets/:id
router.get('/datasets/:id', getDatasetById);

// POST /api/datasets
router.post('/datasets', authMiddleware, createDataset);

// PUT /api/datasets/:id
router.put('/datasets/:id', authMiddleware, updateDataset);
<<<<<<< HEAD
=======

// DELETE /api/datasets/:id
router.delete('/datasets/:id', authMiddleware, deleteDataset);

router.post('/datasets/:id/restore', authMiddleware, restoreDataset);
>>>>>>> 5c5855ebf2c866c6f18f3809753f78e18e71beba

module.exports = router;
