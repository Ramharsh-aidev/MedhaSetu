const mongoose = require('mongoose');

// Import the models
const HealthLog = mongoose.model('HealthLog');
const Patient = mongoose.model('Patient');

// GET /api/health-logs - Get all health logs for the authenticated user
exports.getHealthLogs = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find patient by user ID
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Get all health logs for this patient
    const healthLogs = await HealthLog.find({ patient: patient._id }).sort({ date: -1 });

    // Transform the data to match frontend format
    const vitals = healthLogs
      .filter(log => log.type === 'vital')
      .map(log => ({
        id: log._id,
        date: log.date.toISOString().split('T')[0],
        type: log.logType,
        value: log.value,
        unit: extractUnit(log.value),
        status: log.status,
        notes: log.notes
      }));

    const symptoms = healthLogs
      .filter(log => log.type === 'symptom')
      .map(log => ({
        id: log._id,
        date: log.date.toISOString().split('T')[0],
        symptom: log.logType,
        severity: log.severity,
        notes: log.notes
      }));

    res.json({
      success: true,
      data: {
        vitals,
        symptoms
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/health-logs - Create a new health log
exports.createHealthLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { kind, type, value, unit, status, symptom, severity, notes, date } = req.body;

    // Find patient by user ID
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Create health log
    const healthLog = new HealthLog({
      patient: patient._id,
      type: kind, // 'vital' or 'symptom'
      logType: kind === 'vital' ? type : symptom,
      value: kind === 'vital' ? `${value} ${unit || ''}`.trim() : undefined,
      status: kind === 'vital' ? status : undefined,
      severity: kind === 'symptom' ? severity : undefined,
      notes,
      date: date ? new Date(date) : new Date()
    });

    await healthLog.save();

    // Transform response to match frontend format
    const response = kind === 'vital' ? {
      id: healthLog._id,
      date: healthLog.date.toISOString().split('T')[0],
      type: healthLog.logType,
      value: value,
      unit: unit || '',
      status: healthLog.status,
      notes: healthLog.notes
    } : {
      id: healthLog._id,
      date: healthLog.date.toISOString().split('T')[0],
      symptom: healthLog.logType,
      severity: healthLog.severity,
      notes: healthLog.notes
    };

    res.status(201).json({
      success: true,
      message: 'Health log created successfully',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/health-logs/:id - Update a health log
exports.updateHealthLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { kind, type, value, unit, status, symptom, severity, notes, date } = req.body;

    // Find patient by user ID
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Find and update health log
    const healthLog = await HealthLog.findOne({ _id: id, patient: patient._id });
    if (!healthLog) {
      return res.status(404).json({ success: false, message: 'Health log not found' });
    }

    // Update fields
    healthLog.type = kind;
    healthLog.logType = kind === 'vital' ? type : symptom;
    healthLog.value = kind === 'vital' ? `${value} ${unit || ''}`.trim() : undefined;
    healthLog.status = kind === 'vital' ? status : undefined;
    healthLog.severity = kind === 'symptom' ? severity : undefined;
    healthLog.notes = notes;
    healthLog.date = date ? new Date(date) : healthLog.date;

    await healthLog.save();

    // Transform response to match frontend format
    const response = kind === 'vital' ? {
      id: healthLog._id,
      date: healthLog.date.toISOString().split('T')[0],
      type: healthLog.logType,
      value: value,
      unit: unit || '',
      status: healthLog.status,
      notes: healthLog.notes
    } : {
      id: healthLog._id,
      date: healthLog.date.toISOString().split('T')[0],
      symptom: healthLog.logType,
      severity: healthLog.severity,
      notes: healthLog.notes
    };

    res.json({
      success: true,
      message: 'Health log updated successfully',
      data: response
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/health-logs/:id - Delete a health log
exports.deleteHealthLog = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Find patient by user ID
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Find and delete health log
    const healthLog = await HealthLog.findOneAndDelete({ _id: id, patient: patient._id });
    if (!healthLog) {
      return res.status(404).json({ success: false, message: 'Health log not found' });
    }

    res.json({
      success: true,
      message: 'Health log deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to extract unit from value string
function extractUnit(valueStr) {
  if (!valueStr) return '';
  const parts = valueStr.trim().split(' ');
  return parts.length > 1 ? parts.slice(1).join(' ') : '';
}
