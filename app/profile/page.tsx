'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import AccountShell from '../components/AccountShell';

type Tab = 'profile' | 'password';

function roleLabel(role?: string | null) {
  if (!role) return 'Member';
  return role.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [tab, setTab] = useState<Tab>('profile');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const applyHash = () => {
      if (window.location.hash === '#password') setTab('password');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/account', { credentials: 'include', cache: 'no-store' });
        if (!response.ok) return;
        const user = await response.json();
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.role || session?.user?.role || '');
        setCreatedAt(user.createdAt || '');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session?.user?.role]);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setProfileError('');
    setProfileMessage('');
    try {
      const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setProfileError(data?.error || 'Could not save profile.');
        return;
      }
      await update({ name: data.name, email: data.email });
      setProfileMessage('Profile saved.');
    } catch {
      setProfileError('Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordSaving(true);
    try {
      const response = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setPasswordError(data?.error || 'Could not update password.');
        return;
      }
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password updated.');
    } catch {
      setPasswordError('Could not update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <AccountShell title="Profile">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200 px-4 sm:px-6">
          <nav className="flex gap-6">
            <button
              type="button"
              onClick={() => setTab('profile')}
              className={`py-3 text-sm font-medium border-b-2 ${
                tab === 'profile'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile
            </button>
            <button
              type="button"
              onClick={() => setTab('password')}
              className={`py-3 text-sm font-medium border-b-2 ${
                tab === 'password'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Password
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading profile...</p>
          ) : tab === 'profile' ? (
            <form onSubmit={saveProfile} className="space-y-5 max-w-lg">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{name || session?.user?.name || 'Member'}</p>
                  <p className="text-sm text-gray-500">{roleLabel(role)}</p>
                </div>
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="email"
                  required
                />
              </div>
              {createdAt ? (
                <p className="text-xs text-gray-500">
                  Member since {new Date(createdAt).toLocaleDateString()}
                </p>
              ) : null}
              {profileError ? <p className="text-sm text-red-600">{profileError}</p> : null}
              {profileMessage ? <p className="text-sm text-green-700">{profileMessage}</p> : null}
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save profile'}
              </button>
            </form>
          ) : (
            <form onSubmit={savePassword} className="space-y-5 max-w-lg">
              <div className="flex items-center gap-2 text-gray-800">
                <Lock className="h-5 w-5" />
                <p className="font-medium">Change password</p>
              </div>
              <p className="text-sm text-gray-600">
                Enter your current password, then choose a new password of at least 8 characters.
              </p>
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((open) => !open)}
                    className="absolute inset-y-0 right-0 px-3 text-gray-400"
                    aria-label="Toggle current password"
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((open) => !open)}
                    className="absolute inset-y-0 right-0 px-3 text-gray-400"
                    aria-label="Toggle new password"
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type={showNew ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </div>
              {passwordError ? <p className="text-sm text-red-600">{passwordError}</p> : null}
              {passwordMessage ? <p className="text-sm text-green-700">{passwordMessage}</p> : null}
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {passwordSaving ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
