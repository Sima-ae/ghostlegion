'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, Info, AlertCircle, Zap, Clock, User } from 'lucide-react';

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

interface NotificationPopupProps {
  notification: Notification | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPopup({ 
  notification, 
  isOpen, 
  onClose 
}: NotificationPopupProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && notification) {
      // Mark as read when popup opens
      markAsRead(notification.id);
    }
  }, [isOpen, notification]);

  const markAsRead = async (notificationId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'EMERGENCY':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      case 'ALERT':
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case 'WARNING':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'SYSTEM':
        return <Zap className="h-6 w-6 text-blue-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ALERT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'SYSTEM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !notification) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {getNotificationIcon(notification.type)}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {notification.title}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(notification.priority)}`}>
                    {notification.priority}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full border ${getTypeColor(notification.type)}`}>
                    {notification.type}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Created: {formatDateTime(notification.createdAt)}</span>
              </div>
              {notification.expiresAt && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Expires: {formatDateTime(notification.expiresAt)}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>{notification.isPublic ? 'Public' : 'Private'}</span>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
