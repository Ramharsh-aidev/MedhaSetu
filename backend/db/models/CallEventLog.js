const mongoose = require('mongoose');

const callEventLogSchema = new mongoose.Schema({
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event_type: {
    type: String,
    enum: ['join_lobby', 'leave_lobby', 'call_start', 'call_end', 'report_created', 'reschedule_requested'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
callEventLogSchema.index({ appointment_id: 1, timestamp: -1 });
callEventLogSchema.index({ user_id: 1, event_type: 1 });

module.exports = mongoose.model('CallEventLog', callEventLogSchema);