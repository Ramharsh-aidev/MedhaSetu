import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (user && user._id) {
      try {
        // Dynamically import socket.io-client to avoid SSR issues
        import('socket.io-client').then((io) => {
          const newSocket = io.io('http://localhost:5000');
          
          newSocket.on('connect', () => {
            console.log('Socket connected for notifications');
            newSocket.emit('join', user._id);
          });

          newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
          });

          setSocket(newSocket);
        });

        return () => {
          if (socket) {
            socket.close();
          }
        };
      } catch (error) {
        console.error('Socket connection error:', error);
      }
    }
  }, [user, socket]);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications?unreadOnly=${unreadOnly}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        // Decrease unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [notifications]);

  // Add new notification (for real-time notifications)
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.png',
        tag: notification._id
      });
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  }, []);

  // Set up socket listeners for real-time notifications
  useEffect(() => {
    if (socket && user) {
      const handleNewNotification = (notification) => {
        console.log('Received notification:', notification);
        addNotification(notification);
      };

      const handleAppointmentUpdate = (data) => {
        console.log('Appointment updated:', data);
        // You might want to trigger a refetch of appointments here
        if (data.notification) {
          addNotification(data.notification);
        }
      };

      socket.on('notification', handleNewNotification);
      socket.on('appointmentStatusChanged', handleAppointmentUpdate);

      return () => {
        socket.off('notification', handleNewNotification);
        socket.off('appointmentStatusChanged', handleAppointmentUpdate);
      };
    }
  }, [socket, user, addNotification]);

  // Fetch notifications when user logs in
  useEffect(() => {
    if (user) {
      fetchNotifications();
      requestNotificationPermission();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications, requestNotificationPermission]);

  // Memoized context value
  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    requestNotificationPermission
  }), [
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    requestNotificationPermission
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
