const express= require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors= require("cors")
const morgan= require("morgan")
const dotenv= require("dotenv")
const connectDB = require("./config/db")


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