'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Check, Eye, StickyNote, Trash2, X } from 'lucide-react';
import { MapMemo } from '../types';

type StatusFilter = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

function statusClass(status?: string) {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
}

export default function MemosManagement() {
  const { data: session } = useSession();
  const canDelete =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  const [memos, setMemos] = useState<MapMemo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<MapMemo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MapMemo | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const loadMemos = async () => {
    try {
      const response = await fetch('/api/map-memos?moderation=true', {
        credentials: 'include',
      });
      if (response.ok) {
        const rows = await response.json();
        setMemos(Array.isArray(rows) ? rows : []);
      }
    } catch (error) {
      console.error('Error loading memos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemos();
  }, []);

  const filtered = useMemo(() => {
    const rows =
      statusFilter === 'all'
        ? [...memos]
        : memos.filter((memo) => memo.status === statusFilter);
    return rows.sort((a, b) => {
      const byTime = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (byTime !== 0) return byTime;
      return b.id.localeCompare(a.id);
    });
  }, [memos, statusFilter]);

  const setStatus = async (memo: MapMemo, action: 'approve' | 'reject') => {
    setWorkingId(memo.id);
    try {
      const response = await fetch(`/api/map-memos/${memo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });
      if (!response.ok) return;
      const updated = await response.json();
      setMemos((prev) => prev.map((row) => (row.id === memo.id ? updated : row)));
      setSelected((current) => (current?.id === memo.id ? updated : current));
    } finally {
      setWorkingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setWorkingId(pendingDelete.id);
    try {
      const response = await fetch(`/api/map-memos/${pendingDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) return;
      setMemos((prev) => prev.filter((row) => row.id !== pendingDelete.id));
      setPendingDelete(null);
      setSelected(null);
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-green-700" />
            Map memos
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Approve or decline memos submitted by visitors and members. Approved memos appear on the map.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="all">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Declined</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-10 text-center text-gray-500">Loading memos...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-gray-500">No memos in this list.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Memo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((memo) => (
                <tr key={memo.id}>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                    <p className="line-clamp-2">{memo.body}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {memo.latitude.toFixed(4)}, {memo.longitude.toFixed(4)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                    {memo.createdByName || (memo.createdBy === 'visitor' ? 'Visitor' : 'Member')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-xs text-gray-700">
                    {memo.createdIp || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass(memo.status)}`}>
                      {memo.status === 'REJECTED' ? 'Declined' : memo.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {new Date(memo.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelected(memo)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {memo.status === 'PENDING' || memo.status === 'REJECTED' ? (
                        <button
                          type="button"
                          onClick={() => setStatus(memo, 'approve')}
                          disabled={workingId === memo.id}
                          className="text-green-600 hover:text-green-900 p-1 disabled:opacity-50"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : null}
                      {memo.status === 'PENDING' || memo.status === 'APPROVED' ? (
                        <button
                          type="button"
                          onClick={() => setStatus(memo, 'reject')}
                          disabled={workingId === memo.id}
                          className="text-red-600 hover:text-red-900 p-1 disabled:opacity-50"
                          title="Decline"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(memo)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Memo</h3>
              <button type="button" onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{selected.body}</p>
            <div className="mt-4 text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Author:</span>{' '}
                {selected.createdByName || (selected.createdBy === 'visitor' ? 'Visitor' : 'Member')}
              </p>
              <p>
                <span className="font-medium">IP:</span>{' '}
                <span className="font-mono text-xs">{selected.createdIp || '—'}</span>
              </p>
              <p>
                <span className="font-medium">Location:</span> {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
              </p>
              <p>
                <span className="font-medium">Status:</span> {selected.status === 'REJECTED' ? 'Declined' : selected.status}
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
              {selected.status !== 'APPROVED' ? (
                <button
                  type="button"
                  onClick={() => setStatus(selected, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
              ) : null}
              {selected.status !== 'REJECTED' ? (
                <button
                  type="button"
                  onClick={() => setStatus(selected, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Decline
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900">Delete memo?</h3>
            <p className="text-sm text-gray-600 mt-2">
              This permanently removes the memo. Decline it instead if you only want it hidden from the map.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
