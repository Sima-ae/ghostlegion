'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, X, AlertTriangle, Info, AlertCircle, Zap } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'EMERGENCY' | 'SYSTEM';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  isPublic: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationClick: (notification: Notification) => void;
  onViewAll?: () => void;
}

export default function NotificationDropdown({ 
  isOpen, 
  onClose, 
  onNotificationClick,
  onViewAll
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications?limit=10');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch {
      /* notifications stay empty */
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    onNotificationClick(notification);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'ALERT':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'SYSTEM':
        return <Zap className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'border-l-red-500';
      case 'HIGH':
        return 'border-l-orange-500';
      case 'MEDIUM':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="fixed inset-x-2 top-[4.5rem] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-[80vh] sm:max-h-none"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {unreadCount > 0 
            ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
            : notifications.length > 0 
              ? `${notifications.length} notification${notifications.length !== 1 ? 's' : ''} (all read)`
              : 'No notifications available'
          }
        </p>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No notifications available</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-3 sm:p-4 border-l-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                getPriorityColor(notification.priority)
              } ${!notification.isRead ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start space-x-2 sm:space-x-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm sm:text-base font-medium ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                    }`}>
                      {notification.title}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <div className="flex flex-wrap items-center mt-2 space-x-1 sm:space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      notification.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                      notification.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                      notification.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {notification.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      notification.type === 'EMERGENCY' ? 'bg-red-100 text-red-800' :
                      notification.type === 'ALERT' ? 'bg-orange-100 text-orange-800' :
                      notification.type === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                      notification.type === 'SYSTEM' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {notification.type}
                    </span>
                  </div>
                </div>
                {!notification.isRead && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
          {onViewAll && (
            <button
              onClick={() => {
                onViewAll();
                onClose();
              }}
              className="w-full px-3 sm:px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors font-medium text-sm sm:text-base"
            >
              View All Notifications
            </button>
          )}
          <button
            onClick={loadNotifications}
            className="w-full text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium py-1"
          >
            Refresh notifications
          </button>
        </div>
      )}
    </div>
  );
}
