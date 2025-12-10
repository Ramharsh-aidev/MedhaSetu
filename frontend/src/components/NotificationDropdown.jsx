import React, { useEffect, useRef, useState } from "react";
import { BellIcon, CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../contexts/NotificationContext";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  // close on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment_booked':
      case 'appointment_accepted':
      case 'appointment_rejected':
      case 'appointment_cancelled':
      case 'appointment_reminder':
      case 'appointment_rescheduled':
        return '📅';
      case 'medicine_reminder':
        return '💊';
      case 'message_received':
        return '💬';
      case 'system_notification':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'urgent') return 'text-red-600';
    if (priority === 'high') return 'text-orange-600';
    
    switch (type) {
      case 'appointment_accepted':
        return 'text-green-600';
      case 'appointment_rejected':
      case 'appointment_cancelled':
        return 'text-red-600';
      case 'appointment_rescheduled':
        return 'text-orange-600';
      case 'medicine_reminder':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        aria-label="Notifications"
      >
        <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 
                           bg-red-500 text-white text-[10px] leading-[18px] 
                           font-bold rounded-full text-center animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 max-w-[92vw] z-50
                       bg-white dark:bg-gray-800 rounded-2xl shadow-xl
                       border border-gray-200 dark:border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Notifications
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-lg
                               bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800
                               text-blue-700 dark:text-blue-200 transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" /> Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center p-8 text-gray-500">
                  <BellIcon className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              )}

              {notifications.map(notification => (
                <div
                  key={notification._id}
                  className={`relative border-b border-gray-100 dark:border-gray-700 last:border-b-0
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                             ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Notification Icon */}
                      <div className="flex-shrink-0 text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`text-sm font-medium ${getNotificationColor(notification.type, notification.priority)}`}>
                            {notification.title}
                          </h4>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                         text-gray-500 hover:text-blue-600 transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notification._id, e)}
                              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                       text-gray-500 hover:text-red-600 transition-colors"
                              title="Delete notification"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        {/* Time and Priority */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <ClockIcon className="w-3 h-3" />
                            {formatNotificationTime(notification.createdAt)}
                          </div>
                          
                          {notification.priority === 'urgent' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 
                                           dark:bg-red-900 dark:text-red-200 rounded-full">
                              Urgent
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 
                                           dark:bg-orange-900 dark:text-orange-200 rounded-full">
                              High
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-2 top-1/2 transform -translate-y-1/2 
                                    w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/notifications');
                  }}
                  className="w-full text-sm text-blue-600 dark:text-blue-400 
                           hover:text-blue-800 dark:hover:text-blue-300 
                           font-medium transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
