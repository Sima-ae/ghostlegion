'use client';

import { Bell, Search, User, Settings, LogOut, Shield, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NotificationDropdown from './NotificationDropdown';
import NotificationPopup from './NotificationPopup';
import NotificationSender from './NotificationSender';
import PwaInstallButton from './pwa/PwaInstallButton';

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

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationSenderOpen, setIsNotificationSenderOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [isNotificationPopupOpen, setIsNotificationPopupOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  // Check if user is admin or super admin
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (session?.user) {
      loadUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [session]);

  const loadUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?limit=1');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setIsNotificationPopupOpen(true);
    setIsNotificationOpen(false);
    // Update unread count immediately
    if (!notification.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleViewAllNotifications = () => {
    router.push('/notifications');
  };

  const handleNotificationSent = () => {
    loadUnreadCount(); // Refresh unread count
    setIsNotificationSenderOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg w-full relative z-[1000]">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo and Title - Left Side */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-1 sm:mr-2">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-lg md:text-xl font-bold truncate">Ghost Legion</h1>
              <p className="text-xs text-gray-400 truncate hidden sm:block">We analyze, we hunt, we strike!</p>
            </div>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-md mx-2 sm:mx-4 lg:mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 text-sm border border-gray-600 rounded-md leading-5 bg-gray-800 placeholder-gray-400 focus:outline-none focus:placeholder-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search..."
              />
            </div>
          </div>

          {/* Right side icons and login - Right Side */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 flex-shrink-0">
            <PwaInstallButton />
            {/* Send Notification (All logged-in users) */}
            {session && (
              <button 
                onClick={() => setIsNotificationSenderOpen(true)}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                title="Send Notification"
              >
                <Send className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            )}

            {/* Notifications */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-1.5 sm:p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md touch-manipulation"
              >
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationDropdown
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onNotificationClick={handleNotificationClick}
                onViewAll={handleViewAllNotifications}
              />
            </div>

            {/* Settings */}
            <button className="p-1.5 sm:p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
              <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Login/Profile */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                >
                  <User className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="hidden sm:inline text-sm truncate max-w-20">{session.user?.name || session.user?.email || 'User'}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-[9999]">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Help
                    </a>
                    {(session?.user?.role === 'ADMIN' || session?.user?.role === 'COMMANDER') && (
                      <>
                        <hr className="my-1" />
                        <button
                          onClick={() => router.push('/admin')}
                          className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-100"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </button>
                      </>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/signin')}
                className="px-2 sm:px-4 py-1.5 sm:py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notification Components */}
      <NotificationSender
        isOpen={isNotificationSenderOpen}
        onClose={() => setIsNotificationSenderOpen(false)}
        onSuccess={handleNotificationSent}
      />

      <NotificationPopup
        notification={selectedNotification}
        isOpen={isNotificationPopupOpen}
        onClose={() => {
          setIsNotificationPopupOpen(false);
          setSelectedNotification(null);
        }}
      />
    </header>
  );
}
