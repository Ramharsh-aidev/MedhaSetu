const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getHealthLogs,
  createHealthLog,
  updateHealthLog,
  deleteHealthLog
} = require('../controllers/healthLogController');

// All routes require authentication
router.use(auth);

// GET /api/health-logs - Get all health logs for authenticated user
router.get('/', getHealthLogs);

// POST /api/health-logs - Create a new health log
router.post('/', createHealthLog);

// PUT /api/health-logs/:id - Update a health log
router.put('/:id', updateHealthLog);

// DELETE /api/health-logs/:id - Delete a health log
router.delete('/:id', deleteHealthLog);

module.exports = router;
