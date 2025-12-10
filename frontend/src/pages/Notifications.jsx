// src/pages/Notifications.jsx
import React, { useEffect } from "react";
import { useNotifications } from "../contexts/NotificationContext";
import { BellIcon, CheckIcon, XMarkIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function Notifications() {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    fetchNotifications
  } = useNotifications();

  useEffect(() => {
    // Fetch all notifications (not just unread) when page loads
    fetchNotifications(false);
  }, [fetchNotifications]);

  // Separate notifications by type
  const appointmentNotifications = notifications.filter(n => 
    ['appointment_booked', 'appointment_accepted', 'appointment_rejected', 
     'appointment_cancelled', 'appointment_reminder', 'appointment_rescheduled'].includes(n.type)
  );

  const medicineNotifications = notifications.filter(n => 
    n.type === 'medicine_reminder' || n.type === 'prescription_issued' || n.type === 'prescription_extended'
  );

  const otherNotifications = notifications.filter(n => 
    !['appointment_booked', 'appointment_accepted', 'appointment_rejected', 
      'appointment_cancelled', 'appointment_reminder', 'appointment_rescheduled',
      'medicine_reminder', 'prescription_issued', 'prescription_extended'].includes(n.type)
  );

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Notifications
        </h1>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {unreadCount} unread
              </span>
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                         text-white text-sm font-medium rounded-lg transition-colors"
              >
                <CheckIcon className="w-4 h-4" /> Mark all read
              </button>
            </>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 text-gray-500">
          <BellIcon className="w-16 h-16 mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No notifications yet</h3>
          <p className="text-sm">When you have notifications, they'll appear here.</p>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="space-y-6">
          {/* Appointment Notifications Section */}
          {appointmentNotifications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                  📅 Appointment Notifications
                  {appointmentNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {appointmentNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </h2>
              </div>
              {appointmentNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`relative border-b border-gray-100 dark:border-gray-700 last:border-b-0
                         hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                         ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Notification Icon */}
                  <div className="flex-shrink-0 text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className={`text-lg font-semibold ${getNotificationColor(notification.type, notification.priority)}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {notification.message}
                        </p>
                        
                        {/* Time and Priority */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <ClockIcon className="w-4 h-4" />
                            {formatNotificationTime(notification.createdAt)}
                          </div>
                          
                          {notification.priority === 'urgent' && (
                            <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-800 
                                           dark:bg-red-900 dark:text-red-200 rounded-full">
                              Urgent
                            </span>
                          )}
                          {notification.priority === 'high' && (
                            <span className="px-3 py-1 text-xs font-medium bg-orange-100 text-orange-800 
                                           dark:bg-orange-900 dark:text-orange-200 rounded-full">
                              High Priority
                            </span>
                          )}
                          {!notification.isRead && (
                            <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 
                                           dark:bg-blue-900 dark:text-blue-200 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                     text-gray-500 hover:text-blue-600 transition-colors"
                            title="Mark as read"
                          >
                            <CheckIcon className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteNotification(notification._id, e)}
                          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                   text-gray-500 hover:text-red-600 transition-colors"
                          title="Delete notification"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Unread Indicator */}
                {!notification.isRead && (
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                w-3 h-3 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
              ))}
            </div>
          )}

          {/* Medicine Notifications Section */}
          {medicineNotifications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
                <h2 className="text-lg font-semibold text-green-800 dark:text-green-200 flex items-center gap-2">
                  💊 Medicine Reminders
                  {medicineNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                      {medicineNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </h2>
              </div>
              {medicineNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative border-b border-gray-100 dark:border-gray-700 last:border-b-0
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                             ${!notification.isRead ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                >
                  <div className="flex items-start gap-4 p-6">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                     ${getNotificationColor(notification.type, notification.priority)} 
                                     bg-current bg-opacity-10`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                            {notification.priority && (
                              <span className={`px-2 py-1 rounded-md font-medium
                                              ${notification.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                notification.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                {notification.priority}
                              </span>
                            )}
                            {!notification.isRead && (
                              <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 
                                             dark:bg-green-900 dark:text-green-200 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification._id, e)}
                              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                       text-gray-500 hover:text-green-600 transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification._id, e)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                     text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                    w-3 h-3 bg-green-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Other Notifications Section */}
          {otherNotifications.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/20">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  🔔 Other Notifications
                  {otherNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded-full">
                      {otherNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </h2>
              </div>
              {otherNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`relative border-b border-gray-100 dark:border-gray-700 last:border-b-0
                             hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                             ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                >
                  <div className="flex items-start gap-4 p-6">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg
                                     ${getNotificationColor(notification.type, notification.priority)} 
                                     bg-current bg-opacity-10`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <ClockIcon className="w-4 h-4" />
                              {new Date(notification.createdAt).toLocaleString()}
                            </div>
                            {notification.priority && (
                              <span className={`px-2 py-1 rounded-md font-medium
                                              ${notification.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                notification.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
                                {notification.priority}
                              </span>
                            )}
                            {!notification.isRead && (
                              <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 
                                             dark:bg-blue-900 dark:text-blue-200 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification._id, e)}
                              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                       text-gray-500 hover:text-blue-600 transition-colors"
                              title="Mark as read"
                            >
                              <CheckIcon className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification._id, e)}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 
                                     text-gray-500 hover:text-red-600 transition-colors"
                            title="Delete notification"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Unread Indicator */}
                    {!notification.isRead && (
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                    w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
