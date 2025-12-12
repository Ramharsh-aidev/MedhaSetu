const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { 
    type: String, 
    unique: true, 
    sparse: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["patient", "doctor", "pharmacist"],
    required: true,
    default: "patient"
  },
  // Doctor-specific fields (optional during registration, can be filled later)
  specialization: {
    type: String,
    enum: [
      "General Medicine", "Cardiology", "Dermatology", "Neurology", 
      "Orthopedics", "Pediatrics", "Psychiatry", "Ophthalmology", 
      "ENT", "Gynecology", "Urology", "Oncology", "Emergency Medicine",
      "Internal Medicine", "Gastroenterology", "Pulmonology", "Endocrinology"
    ]
  },
  experience_years: {
    type: Number
  },
  qualification: {
    type: String
  },
  registration_number: {
    type: String,
    unique: true,
    sparse: true
  },
  // Pharmacist-specific fields (optional during registration)
  pharmacy_name: {
    type: String
  },
  pharmacy_address: {
    type: String
  },
  availability: {
    type: Map,
    of: [{
      start_time: String,
      end_time: String
    }],
    default: function() {
      if (this.role === 'doctor') {
        return new Map([
          ['monday', [{ start_time: '09:00', end_time: '17:00' }]],
          ['tuesday', [{ start_time: '09:00', end_time: '17:00' }]],
          ['wednesday', [{ start_time: '09:00', end_time: '17:00' }]],
          ['thursday', [{ start_time: '09:00', end_time: '17:00' }]],
          ['friday', [{ start_time: '09:00', end_time: '17:00' }]],
          ['saturday', [{ start_time: '09:00', end_time: '13:00' }]]
        ]);
      }
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.0
  },
  total_patients_treated: {
    type: Number,
    default: 0
  },
  is_available: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: function() { return this.role !== 'doctor'; }
  },
  // Video call tracking fields
  no_show_count: {
    type: Number,
    default: 0
  },
  report_count: {
    type: Number,
    default: 0
  },
  blocked_until: Date,
  is_blocked: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

module.exports = { User: mongoose.model("User", userSchema) };
