import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { socketService } from '../../services/socketService';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  UserIcon,
  CheckIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

const EmergencyNotifications = () => {
  const { user } = useAuth();
  const [emergencyNotifications, setEmergencyNotifications] = useState([]);
  const [awaitingAppointments, setAwaitingAppointments] = useState([]);
  const [responding, setResponding] = useState({});

  // Fetch existing awaiting appointments on component mount
  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchAwaitingAppointments();
    }
  }, [user]);

  // Socket event listeners for real-time emergency notifications
  useEffect(() => {
    if (user?.role !== 'doctor' || !socketService.socket) return;

    const socket = socketService.socket;

    // New emergency assignment received
    socket.on('emergency_assignment_received', (data) => {
      console.log('🚨 Emergency assignment received:', data);
      
      const notification = {
        id: data.appointmentId,
        patient: data.patient,
        urgency: data.urgency,
        symptoms: data.symptoms,
        estimatedDuration: data.estimatedDuration,
        responseDeadline: data.responseDeadline,
        specialization: data.specialization,
        receivedAt: new Date()
      };

      setEmergencyNotifications(prev => {
        // Avoid duplicates
        if (prev.some(n => n.id === notification.id)) return prev;
        return [notification, ...prev];
      });

      // Play notification sound (optional)
      playEmergencySound();
    });

    // Assignment confirmed (doctor accepted)
    socket.on('emergency_assignment_confirmed', (data) => {
      console.log('✅ Emergency assignment confirmed:', data);
      
      // Remove from notifications
      setEmergencyNotifications(prev => 
        prev.filter(n => n.id !== data.appointmentId)
      );

      // Navigate to video call or show success message
      if (data.canJoinCall) {
        // Could redirect to video call here
        console.log('Can join video call for appointment:', data.appointmentId);
      }
    });

    // Assignment expired (another doctor accepted)
    socket.on('emergency_assignment_expired', (data) => {
      console.log('⏰ Emergency assignment expired:', data);
      
      setEmergencyNotifications(prev => 
        prev.filter(n => n.id !== data.appointmentId)
      );

      // Show brief message that case was taken by another doctor
      showExpiredMessage(data.message);
    });

    return () => {
      if (socket) {
        socket.off('emergency_assignment_received');
        socket.off('emergency_assignment_confirmed');
        socket.off('emergency_assignment_expired');
      }
    };
  }, [user]);

  // Auto-remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setEmergencyNotifications(prev => 
        prev.filter(notification => {
          const deadline = new Date(notification.responseDeadline);
          return deadline > now;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchAwaitingAppointments = async () => {
    try {
      const response = await fetch('/api/emergency-appointments/awaiting', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAwaitingAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error('Error fetching awaiting appointments:', error);
    }
  };

  const handleEmergencyResponse = async (appointmentId, response) => {
    setResponding(prev => ({ ...prev, [appointmentId]: true }));

    try {
      const apiResponse = await fetch(`/api/emergency-appointments/respond/${appointmentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ response })
      });

      const result = await apiResponse.json();

      if (result.success) {
        // Remove notification from list
        setEmergencyNotifications(prev => 
          prev.filter(n => n.id !== appointmentId)
        );

        if (response === 'accept') {
          // Show success message and prepare for video call
          console.log('Emergency appointment accepted:', result.appointment);
          // Could show join call button or redirect
        } else {
          // Show rejection confirmation
          console.log('Emergency appointment rejected, reassigning...');
        }
      } else {
        console.error('Error responding to emergency:', result.message);
        alert(result.message);
      }
    } catch (error) {
      console.error('Error responding to emergency appointment:', error);
      alert('Failed to respond to emergency appointment');
    } finally {
      setResponding(prev => ({ ...prev, [appointmentId]: false }));
    }
  };

  const playEmergencySound = () => {
    // Simple notification sound
    try {
      const audio = new Audio('/emergency-notification.mp3'); // Add this sound file to public folder
      audio.play().catch(() => console.log('Could not play notification sound'));
    } catch {
      console.log('Emergency sound not available');
    }
  };

  const showExpiredMessage = (message) => {
    // Could show a toast notification
    console.log('Emergency expired:', message);
  };

  const calculateTimeRemaining = (deadline) => {
    const now = new Date();
    const timeLeft = new Date(deadline) - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const minutes = Math.floor(timeLeft / 60000);
    const seconds = Math.floor((timeLeft % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (user?.role !== 'doctor') return null;

  return (
    <>
      {/* Emergency Notifications Overlay */}
      {emergencyNotifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3">
          {emergencyNotifications.map(notification => (
            <div
              key={notification.id}
              className="bg-white dark:bg-gray-800 border-l-4 border-red-500 rounded-lg shadow-2xl max-w-md p-4 animate-pulse"
            >
              <div className="flex items-start">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500 mr-3 mt-1 flex-shrink-0" />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                      🚨 Emergency Case
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(notification.urgency)}`}>
                      {notification.urgency?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="flex items-center">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-medium">{notification.patient?.name}</span>
                      {notification.patient?.age && (
                        <span className="text-gray-500 ml-1">({notification.patient.age}y)</span>
                      )}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <p className="text-sm"><strong>Symptoms:</strong> {notification.symptoms}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        <span className="text-xs">
                          {calculateTimeRemaining(notification.responseDeadline)} remaining
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        ~{notification.estimatedDuration}min
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleEmergencyResponse(notification.id, 'accept')}
                      disabled={responding[notification.id]}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      <CheckIcon className="w-4 h-4 mr-2" />
                      {responding[notification.id] ? 'Accepting...' : 'Accept'}
                    </button>
                    
                    <button
                      onClick={() => handleEmergencyResponse(notification.id, 'reject')}
                      disabled={responding[notification.id]}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center disabled:opacity-50"
                    >
                      <XMarkIcon className="w-4 h-4 mr-2" />
                      {responding[notification.id] ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Awaiting Appointments List (for doctor dashboard) */}
      {awaitingAppointments.length > 0 && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-3 flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Emergency Cases Awaiting Response
          </h3>
          
          <div className="space-y-3">
            {awaitingAppointments.map(appointment => (
              <div key={appointment.id} className="bg-white dark:bg-gray-800 p-3 rounded border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{appointment.patient?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.symptoms}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Time remaining: {calculateTimeRemaining(appointment.responseDeadline)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEmergencyResponse(appointment.id, 'accept')}
                      disabled={responding[appointment.id]}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleEmergencyResponse(appointment.id, 'reject')}
                      disabled={responding[appointment.id]}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default EmergencyNotifications;