# MedhaSetu - Healthcare Management Platform

A comprehensive healthcare management platform developed by **Ramharsh Sanjay Dandekar** that connects patients, doctors, and pharmacies through innovative, secure technology.

## 🏥 About MedhaSetu

MedhaSetu is a modern healthcare management platform designed to revolutionize the way patients, healthcare providers, and pharmacies interact. Built with cutting-edge technologies and a focus on user experience, MedhaSetu provides a seamless, secure, and efficient healthcare ecosystem.

## ✨ Key Features

### 🏠 Patient Portal
- **Unified Dashboard**: Complete medical history and health overview
- **Smart Appointment Booking**: AI-powered scheduling system
- **Health Tracking**: Monitor vital signs and health metrics
- **Prescription Management**: Digital prescriptions and refill tracking
- **Telemedicine**: Video consultations with healthcare providers

### 👨‍⚕️ Doctor Portal
- **Patient Management**: Comprehensive patient records and history
- **Appointment Scheduling**: Efficient calendar and booking system
- **Digital Prescriptions**: Electronic prescription writing and management
- **Video Consultations**: Secure telemedicine platform
- **Health Analytics**: Patient health trend analysis

### 💊 Pharmacy Integration
- **Medicine Catalog**: Comprehensive drug database
- **Order Management**: Prescription fulfillment and tracking
- **Inventory Management**: Real-time stock monitoring
- **Delivery Tracking**: Order status and delivery updates

### 🤖 AI Health Assistant
- **Symptom Analysis**: AI-powered health assessment
- **Health Recommendations**: Personalized health advice
- **Appointment Assistance**: Smart scheduling suggestions
- **Medical Q&A**: Instant health-related answers

## 🚀 Technology Stack

### Frontend
- **React 19**: Modern UI library with latest features
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Firebase Auth**: Secure authentication system

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for scalability
- **Socket.io**: Real-time communication
- **JWT**: Secure token-based authentication

### AI Integration
- **Google Gemini API**: Advanced AI capabilities
- **Natural Language Processing**: Intelligent text analysis
- **Machine Learning**: Predictive health analytics

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ramharsh-aidev/MedhaSetu.git
   cd MedhaSetu
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Configure your environment variables
   npm run dev
   ```

4. **Access the Application**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_email_username
EMAIL_PASS=your_email_password
PORT=5000
```

#### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_BACKEND_URL=http://localhost:5000
```

## 🏗️ Project Structure

```
MedhaSetu/
├── backend/                 # Node.js backend
│   ├── controllers/        # Request handlers
│   ├── models/            # Database schemas
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── server.js          # Main server file
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── README.md              # This file
```

## 🔐 Security Features

- **HIPAA Compliance**: Healthcare data protection standards
- **End-to-End Encryption**: Secure data transmission
- **Role-Based Access Control**: User permission management
- **Secure Authentication**: Multi-factor authentication support
- **Data Privacy**: Strict privacy controls and data handling

## 🎨 Design Features

- **Responsive Design**: Works on all devices
- **Dark/Light Mode**: User preference themes
- **Accessibility**: WCAG 2.1 compliant
- **Modern UI**: Clean and intuitive interface
- **Real-time Updates**: Live data synchronization

## 📱 Platform Support

- **Web Application**: Cross-browser compatibility
- **Mobile Responsive**: Optimized for mobile devices
- **Progressive Web App**: Offline capabilities
- **API Integration**: RESTful API for third-party integration

## 🛠️ Development

### Scripts

#### Backend
```bash
npm start          # Start production server
npm run dev        # Start development server
npm test           # Run tests
```

#### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## 📊 Features in Detail

### Healthcare Management
- Patient registration and profile management
- Medical history tracking and analysis
- Appointment scheduling and reminders
- Prescription management and tracking
- Health monitoring and analytics

### Communication
- Real-time messaging between patients and doctors
- Video consultation platform
- Appointment notifications and reminders
- Health alerts and recommendations

### Data Management
- Secure patient data storage
- Medical record digitization
- Health data analytics and reporting
- Backup and data recovery systems

## 🔍 API Documentation

The MedhaSetu API provides comprehensive endpoints for:
- User authentication and authorization
- Patient and doctor management
- Appointment scheduling and management
- Prescription and pharmacy operations
- Health data analytics and reporting

## 🚀 Future Enhancements

- **Mobile Application**: Native iOS and Android apps
- **Wearable Integration**: IoT device connectivity
- **Advanced AI**: Enhanced diagnostic capabilities
- **Blockchain**: Secure medical record management
- **Multi-language Support**: Localization features

## 📧 Contact

**Developer**: Ramharsh Sanjay Dandekar  
**GitHub**: [@Ramharsh-aidev](https://github.com/Ramharsh-aidev)  
**Project Repository**: [MedhaSetu](https://github.com/Ramharsh-aidev/MedhaSetu)

## 📄 License

This project is proprietary software developed by Ramharsh Sanjay Dandekar. All rights reserved.

---

⚡ **Built with passion for healthcare innovation and modern technology**

🏥 *Making healthcare accessible, efficient, and user-friendly for everyone*

