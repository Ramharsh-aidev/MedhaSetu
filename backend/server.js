const express= require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors= require("cors")
const morgan= require("morgan")
const dotenv= require("dotenv")
const connectDB = require("./config/db")

// Import middleware
const { notFound, errorHandler } = require('./middleware/error');

// Import controllers
const { handleSocketConnection } = require('./controllers/socketController');
const WebRTCSignaling = require('./controllers/webRTCController');
const { checkAndSendReminders } = require('./controllers/medicineReminderController');

// Import routes
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const videoCallRoutes = require('./routes/videoCallRoutes');
const medicineReminderRoutes = require('./routes/medicineReminderRoutes');
const healthLogRoutes = require('./routes/healthLogRoutes');
const aiHealthAssistantRoutes = require('./routes/aiHealthAssistantRoutes');
const aiSchedulerRoutes = require('./routes/aiSchedulerRoutes');
const aiAppointmentRoutes = require('./routes/aiAppointmentRoutes');
const emergencyAppointmentRoutes = require('./routes/emergencyAppointmentRoutes');
const appointmentStatusRoutes = require('./routes/appointmentStatusRoutes');
const serverTimeRoutes = require('./routes/serverTimeRoutes');

dotenv.config();
connectDB();

const app= express();
const server = http.createServer(app);

// CORS configuration for both development and production
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
  ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"];

console.log('🌐 Allowed Origins:', allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize WebRTC signaling
const webrtcSignaling = new WebRTCSignaling(io);

handleSocketConnection(io);

// Make io available in request object
app.set('io', io);
app.set('webrtcSignaling', webrtcSignaling);

// DISABLED: Start appointment status monitoring 
// Temporarily disabled to prevent aggressive status updates
// const { startStatusMonitoring } = require('./controllers/appointmentStatusMonitor');
// startStatusMonitoring(io);
console.log('⏸️  Automatic appointment status monitoring is DISABLED');

app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
    res.json({status: "backend is running"});
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/video-call', videoCallRoutes);
app.use('/api/medicine-reminders', medicineReminderRoutes);
app.use('/api/health-logs', healthLogRoutes);
app.use('/api/ai-health-assistant', aiHealthAssistantRoutes);
app.use('/api/ai-scheduler', aiSchedulerRoutes);
app.use('/api/ai-appointments', aiAppointmentRoutes);
app.use('/api/emergency-appointments', emergencyAppointmentRoutes);
app.use('/api/appointment-status', appointmentStatusRoutes);
app.use('/api/server-time', serverTimeRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with Socket.IO`);
  
  // Start emergency timeout service
  const emergencyTimeoutService = require('./services/emergencyTimeoutService');
  emergencyTimeoutService.start();
  
  // Set up medicine reminder cron job (check every minute)
  setInterval(() => {
    checkAndSendReminders(io);
  }, 60000); // 60 seconds
});