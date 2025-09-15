'use client';

import { Bell, Search, User, Settings, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  return (
    <header className="bg-gray-900 text-white shadow-lg w-full">
      <div className="w-full px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 w-full">
          {/* Logo and Title - Left Side */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <div className="hidden sm:block min-w-0">
              <h1 className="text-lg sm:text-xl font-bold truncate">Ghost Legion</h1>
              <p className="text-xs text-gray-400 truncate">Military Preparedness Platform</p>
            </div>
            <div className="block sm:hidden">
              <h1 className="text-lg font-bold">GL</h1>
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
            {/* Notifications */}
            <button className="relative p-1.5 sm:p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-gray-900"></span>
            </button>

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
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Settings
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Help
                    </a>
                    {session?.user?.role === 'ADMIN' && (
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
    </header>
  );
}
