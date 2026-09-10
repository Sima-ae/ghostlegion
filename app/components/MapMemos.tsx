'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Marker, useMap } from 'react-leaflet';
import { useSession } from 'next-auth/react';
import L from 'leaflet';
import { StickyNote, X, AlertTriangle } from 'lucide-react';
import { memoMarkerIcon } from '../lib/leaflet-icons';
import { MapMemo } from '../types';

type Draft = {
  id?: string;
  latitude: number;
  longitude: number;
  body: string;
  createdByName?: string | null;
};

function stopMapEvent(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

export default function MapMemos() {
  const map = useMap();
  const { data: session, status } = useSession();
  const icon = useMemo(() => memoMarkerIcon(), []);
  const isPublisher =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  const canPlace = status !== 'loading';
  const canEdit = Boolean(session?.user?.id);
  const canDelete =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

  const [memos, setMemos] = useState<MapMemo[]>([]);
  const [placing, setPlacing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState('');

  const loadMemos = useCallback(async () => {
    try {
      const response = await fetch(`/api/map-memos?t=${Date.now()}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!response.ok) return;
      const rows = await response.json();
      if (Array.isArray(rows)) setMemos(rows);
    } catch {
      /* keep current pins if reload fails */
    }
  }, []);

  useEffect(() => {
    loadMemos();
  }, [loadMemos]);

  useEffect(() => {
    const container = map.getContainer();
    const panes = ['overlayPane', 'markerPane', 'shadowPane', 'tooltipPane', 'popupPane']
      .map((name) => map.getPane(name))
      .filter((pane): pane is HTMLElement => Boolean(pane));

    if (placing) {
      container.classList.add('gl-placing-memo');
      map.closePopup();
      panes.forEach((pane) => {
        pane.style.pointerEvents = 'none';
      });
    } else {
      container.classList.remove('gl-placing-memo');
      panes.forEach((pane) => {
        pane.style.pointerEvents = '';
      });
    }

    return () => {
      container.classList.remove('gl-placing-memo');
      panes.forEach((pane) => {
        pane.style.pointerEvents = '';
      });
    };
  }, [map, placing]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setPlacing(false);
      if (!saving && !deleting) {
        setDraft(null);
        setPendingDelete(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saving, deleting]);

  useEffect(() => {
    if (!placing || !canPlace) return;
    const container = map.getContainer();
    map.dragging.disable();
    map.doubleClickZoom.disable();

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.gl-memo-ui, .leaflet-control, .leaflet-popup')) return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const rect = container.getBoundingClientRect();
      const latlng = map.containerPointToLatLng(
        L.point(event.clientX - rect.left, event.clientY - rect.top)
      );
      setDraft({
        latitude: Number(latlng.lat.toFixed(7)),
        longitude: Number(latlng.lng.toFixed(7)),
        body: '',
      });
      setPlacing(false);
      setError('');
    };

    container.addEventListener('click', onClick, true);
    return () => {
      container.removeEventListener('click', onClick, true);
      map.dragging.enable();
      map.doubleClickZoom.enable();
    };
  }, [placing, canPlace, map]);

  const openMemo = (memo: MapMemo) => {
    setPlacing(false);
    setError('');
    setDraft({
      id: memo.id,
      latitude: memo.latitude,
      longitude: memo.longitude,
      body: memo.body,
      createdByName: memo.createdByName,
    });
  };

  const saveDraft = async () => {
    if (!draft || saving) return;
    if (draft.id && !canEdit) return;
    const body = draft.body.trim();
    if (!body) {
      setError('Write a memo before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const response = await fetch(draft.id ? `/api/map-memos/${draft.id}` : '/api/map-memos', {
        method: draft.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-store',
        body: JSON.stringify({
          body,
          latitude: draft.latitude,
          longitude: draft.longitude,
        }),
      });
      const saved = await response.json().catch(() => null);
      if (!response.ok) {
        setError(saved?.error || 'Could not save this memo.');
        return;
      }
      setDraft(null);
      if (!draft.id && saved?.status === 'PENDING') {
        setSubmittedNotice('Your memo was submitted for review. It will appear on the map after approval.');
        setMemos((prev) => prev.filter((memo) => memo.id !== saved.id));
      } else {
        setSubmittedNotice('');
        if (saved?.id && saved.status !== 'REJECTED') {
          setMemos((prev) => [saved, ...prev.filter((memo) => memo.id !== saved.id)]);
        }
      }
      await loadMemos();
    } catch {
      setError('Could not save this memo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete?.id || !canDelete || deleting) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/map-memos/${pendingDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) return;
      setPendingDelete(null);
      setDraft(null);
      await loadMemos();
    } finally {
      setDeleting(false);
    }
  };

  const visibleMemos = memos.filter((memo) => memo.id !== draft?.id);

  return (
    <>
      {visibleMemos.map((memo) => (
        <Marker
          key={memo.id}
          position={[memo.latitude, memo.longitude]}
          icon={icon}
          eventHandlers={{
            click: (event) => {
              L.DomEvent.stopPropagation(event.originalEvent);
              openMemo(memo);
            },
          }}
        />
      ))}
      {draft ? (
        <Marker position={[draft.latitude, draft.longitude]} icon={icon} />
      ) : null}
      {createPortal(
        <>
          {canPlace ? (
            <div
              className="gl-memo-ui absolute z-[1100] top-3 right-3 pointer-events-auto"
              onMouseDown={stopMapEvent}
              onClick={stopMapEvent}
              onDoubleClick={stopMapEvent}
            >
              <button
                type="button"
                onClick={() => {
                  setDraft(null);
                  setPlacing((open) => !open);
                  setError('');
                  setSubmittedNotice('');
                }}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium shadow-md border ${
                  placing
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <StickyNote className="h-4 w-4" />
                {placing ? 'Click map to place' : 'Add memo'}
              </button>
            </div>
          ) : null}

          {placing ? (
            <div className="absolute z-[1100] left-1/2 -translate-x-1/2 bottom-8 pointer-events-none">
              <div className="bg-slate-900/90 text-white text-xs sm:text-sm px-3 py-2 rounded-md shadow">
                Click the map to place a memo. Esc to cancel.
              </div>
            </div>
          ) : null}

          {submittedNotice ? (
            <div className="absolute z-[1100] left-1/2 -translate-x-1/2 top-3 pointer-events-auto max-w-md px-3">
              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm px-3 py-2 rounded-md shadow flex items-start gap-2">
                <p className="flex-1">{submittedNotice}</p>
                <button
                  type="button"
                  onClick={() => setSubmittedNotice('')}
                  className="text-amber-700 hover:text-amber-900"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : null}

          {draft && typeof document !== 'undefined'
            ? createPortal(
                <MemoCard
                  map={map}
                  draft={draft}
                  canWrite={draft.id ? canEdit : true}
                  needsReview={!draft.id && !isPublisher}
                  canDelete={canDelete}
                  saving={saving}
                  error={error}
                  onChange={(body) => {
                    setDraft((current) => (current ? { ...current, body } : current));
                    setError('');
                  }}
                  onSave={saveDraft}
                  onClose={() => {
                    if (!saving) setDraft(null);
                  }}
                  onDelete={() => setPendingDelete(draft)}
                />,
                document.body
              )
            : null}

          {pendingDelete && typeof document !== 'undefined'
            ? createPortal(
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
                  <div
                    className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                    onMouseDown={stopMapEvent}
                    onClick={stopMapEvent}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Delete memo?</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          This will permanently remove this memo from the map.
                        </p>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-md p-3 mb-5">
                      <p className="text-sm text-red-700">This action cannot be undone.</p>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingDelete(null)}
                        disabled={deleting}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={confirmDelete}
                        disabled={deleting}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleting ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )
            : null}
        </>,
        map.getContainer()
      )}
    </>
  );
}

function MemoCard({
  map,
  draft,
  canWrite,
  needsReview,
  canDelete,
  saving,
  error,
  onChange,
  onSave,
  onClose,
  onDelete,
}: {
  map: L.Map;
  draft: Draft;
  canWrite: boolean;
  needsReview?: boolean;
  canDelete: boolean;
  saving: boolean;
  error: string;
  onChange: (body: string) => void;
  onSave: () => void;
  onClose: () => void;
  onDelete: () => void;
}) {
  const [point, setPoint] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const update = () => {
      const next = map.latLngToContainerPoint(L.latLng(draft.latitude, draft.longitude));
      const rect = map.getContainer().getBoundingClientRect();
      setPoint({ x: rect.left + next.x, y: rect.top + next.y });
    };
    update();
    map.on('move zoom zoomend viewreset', update);
    window.addEventListener('resize', update);
    return () => {
      map.off('move zoom zoomend viewreset', update);
      window.removeEventListener('resize', update);
    };
  }, [map, draft.latitude, draft.longitude]);

  return (
    <div
      className="fixed z-[1200] pointer-events-auto w-[min(20rem,calc(100vw-1.5rem))]"
      style={{
        left: point.x,
        top: point.y - 12,
        transform: 'translate(-50%, -100%)',
      }}
      onMouseDown={stopMapEvent}
      onClick={stopMapEvent}
      onDoubleClick={stopMapEvent}
    >
      <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-sm font-medium text-gray-800">
              {draft.id ? 'Edit memo' : 'Add a memo to the map'}
            </p>
            {draft.createdByName ? (
              <p className="text-xs text-gray-500 mt-0.5">{draft.createdByName}</p>
            ) : null}
            {needsReview ? (
              <p className="text-xs text-amber-700 mt-1">
                This memo will be reviewed before it appears on the map.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {canWrite ? (
          <textarea
            value={draft.body}
            onChange={(event) => onChange(event.target.value)}
            maxLength={2000}
            rows={3}
            placeholder="Write your memo"
            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
            autoFocus
          />
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{draft.body}</p>
        )}
        {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
        {canWrite ? (
          <div className="mt-3 space-y-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-md bg-gray-100 text-gray-800 py-2 text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={saving}
                className="flex-1 rounded-md bg-green-600 text-white py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
            {draft.id && canDelete ? (
              <button
                type="button"
                onClick={onDelete}
                className="w-full rounded-md bg-red-50 text-red-700 py-2 text-sm font-medium hover:bg-red-100"
              >
                Delete
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
