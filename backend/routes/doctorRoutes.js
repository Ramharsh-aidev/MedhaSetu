const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllDoctors,
  getDoctorById,
  createDoctorProfile,
  updateDoctorProfile
} = require('../controllers/doctorController');

// GET /api/doctors - Get all doctors (public)
router.get('/', getAllDoctors);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', getDoctorById);

// POST /api/doctors - Create doctor profile (auth required)
router.post('/', auth, createDoctorProfile);

// PUT /api/doctors/:id - Update doctor profile (auth required)
router.put('/:id', auth, updateDoctorProfile);

module.exports = router;