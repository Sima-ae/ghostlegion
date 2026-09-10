'use client';

import { Bell, Lock, LogOut, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AccountShell from '../components/AccountShell';

function roleLabel(role?: string | null) {
  if (!role) return 'Member';
  return role.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <AccountShell title="Settings">
      <div className="space-y-4">
        <section className="bg-white rounded-lg shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Account</h2>
          <p className="text-sm text-gray-600 mb-4">
            {session?.user?.name || 'Member'} · {session?.user?.email} · {roleLabel(session?.user?.role)}
          </p>
          <button
            type="button"
            onClick={() => router.push('/profile')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
          >
            <User className="h-4 w-4" />
            Edit profile
          </button>
        </section>

        <section className="bg-white rounded-lg shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Security</h2>
          <p className="text-sm text-gray-600 mb-4">
            Change your password from the Profile page. You will stay signed in on this device.
          </p>
          <button
            type="button"
            onClick={() => router.push('/profile#password')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
          >
            <Lock className="h-4 w-4" />
            Change password
          </button>
        </section>

        <section className="bg-white rounded-lg shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Notifications</h2>
          <p className="text-sm text-gray-600 mb-4">
            In-app alerts and memos appear in the bell menu. Open the full list to review older items.
          </p>
          <button
            type="button"
            onClick={() => router.push('/notifications')}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"
          >
            <Bell className="h-4 w-4" />
            Open notifications
          </button>
        </section>

        <section className="bg-white rounded-lg shadow-sm border p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Session</h2>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-red-50 text-red-700 hover:bg-red-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </section>
      </div>
    </AccountShell>
  );
}
