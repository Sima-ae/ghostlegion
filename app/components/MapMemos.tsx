'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Marker, useMap } from 'react-leaflet';
import { useSession } from 'next-auth/react';
import L from 'leaflet';
import { StickyNote, X, AlertTriangle } from 'lucide-react';
import { memoMarkerIcon } from '../lib/leaflet-icons';
import { MapMemo, MAX_MEMO_BODY, ANONYMOUS_LABEL } from '../types';
import { MAP_FOCUS_SETTLED_EVENT, type MapFocusTarget } from '../lib/map-focus';

type Draft = {
  id?: string;
  latitude: number;
  longitude: number;
  body: string;
  createdBy?: string | null;
  createdByName?: string | null;
  isPrivate?: boolean;
  isAnonymous?: boolean;
};

function stopMapEvent(event: { stopPropagation: () => void }) {
  event.stopPropagation();
}

function expectedAnswerFromQuestion(question: string): number | null {
  const match = question.replace(/−/g, '-').match(/(\d+)\s*([+-])\s*(\d+)/);
  if (!match) return null;
  const a = Number(match[1]);
  const b = Number(match[3]);
  if (match[2] === '+') return a + b;
  if (match[2] === '-') return a - b;
  return null;
}

export default function MapMemos() {
  const map = useMap();
  const { data: session, status } = useSession();
  const icon = useMemo(() => memoMarkerIcon(), []);
  const isPublisher =
    session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';
  const canEditAll =
    session?.user?.role === 'ADMIN' ||
    session?.user?.role === 'SUPER_ADMIN' ||
    session?.user?.role === 'COMMANDER';
  const canPlace = status !== 'loading';
  const canDelete = isPublisher;

  const canEditDraft = (draft: Draft | null) => {
    if (!draft) return false;
    if (!draft.id) return true;
    if (canEditAll) return true;
    return Boolean(session?.user?.id && draft.createdBy === session.user.id);
  };

  const [memos, setMemos] = useState<MapMemo[]>([]);
  const [placing, setPlacing] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Draft | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [focusMemoId, setFocusMemoId] = useState<string | null>(null);
  const isVisitor = status === 'unauthenticated';
  const captchaExpected = expectedAnswerFromQuestion(captchaQuestion);
  const captchaOk =
    captchaExpected !== null && captchaAnswer.trim() === String(captchaExpected);
  const requiresCaptcha = Boolean(draft && !draft.id && isVisitor);

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

  const loadCaptcha = useCallback(async () => {
    setCaptchaQuestion('');
    setCaptchaToken('');
    setCaptchaAnswer('');
    try {
      const response = await fetch('/api/map-memos/captcha', { cache: 'no-store' });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.question || !data?.token) {
        setError('Could not load the math question. Close and try again.');
        return;
      }
      setCaptchaQuestion(data.question);
      setCaptchaToken(data.token);
    } catch {
      setError('Could not load the math question. Close and try again.');
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
    if (!requiresCaptcha) return;
    loadCaptcha();
  }, [requiresCaptcha, draft?.latitude, draft?.longitude, loadCaptcha]);

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
        isPrivate: false,
        isAnonymous: false,
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
      createdBy: memo.createdBy,
      createdByName: memo.createdByName,
      isPrivate: Boolean(memo.isPrivate),
      isAnonymous: Boolean(memo.isAnonymous),
    });
  };

  useLayoutEffect(() => {
    const onFocus = (event: Event) => {
      const target = (event as CustomEvent<MapFocusTarget>).detail;
      if (target?.type === 'memo') setFocusMemoId(target.id);
    };
    window.addEventListener(MAP_FOCUS_SETTLED_EVENT, onFocus);
    return () => window.removeEventListener(MAP_FOCUS_SETTLED_EVENT, onFocus);
  }, []);

  useEffect(() => {
    if (!focusMemoId) return;
    const memo = memos.find((item) => item.id === focusMemoId);
    if (!memo) return;
    openMemo(memo);
    setFocusMemoId(null);
  }, [focusMemoId, memos]);

  const saveDraft = async () => {
    if (!draft || saving) return;
    if (draft.id && !canEditDraft(draft)) return;
    const body = draft.body.trim();
    if (!body) {
      setError('Write a memo before saving.');
      return;
    }
    if (body.length > MAX_MEMO_BODY) {
      setError(`Memo is too long (max ${MAX_MEMO_BODY} characters).`);
      return;
    }
    if (requiresCaptcha && !captchaOk) {
      setError('Solve the math question to save.');
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
          isPrivate: Boolean(draft.isPrivate),
          isAnonymous: Boolean(draft.isAnonymous),
          ...(requiresCaptcha
            ? { captchaToken, captchaAnswer: captchaAnswer.trim() }
            : {}),
        }),
      });
      const saved = await response.json().catch(() => null);
      if (!response.ok) {
        setError(saved?.error || 'Could not save this memo.');
        if (requiresCaptcha) await loadCaptcha();
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
              className="gl-memo-ui absolute z-[1100] top-3 right-2 sm:right-3 pointer-events-auto"
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
                className={`flex items-center justify-center gap-2 rounded-lg p-2 sm:px-3 sm:py-2 text-sm font-medium shadow-md border ${
                  placing
                    ? 'bg-green-600 text-white border-green-700'
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                }`}
                title={placing ? 'Click map to place' : 'Add memo'}
                aria-label={placing ? 'Click map to place' : 'Add memo'}
              >
                <StickyNote className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">
                  {placing ? 'Click map to place' : 'Add memo'}
                </span>
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
            <div className="absolute z-[1100] left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 top-14 sm:top-3 pointer-events-auto sm:max-w-md px-0 sm:px-3">
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
                  authorName={
                    draft.isAnonymous
                      ? ANONYMOUS_LABEL
                      : draft.createdBy && session?.user?.id === draft.createdBy
                        ? session.user.name || draft.createdByName
                        : draft.createdByName
                  }
                  canWrite={canEditDraft(draft)}
                  needsReview={!draft.id && !isPublisher}
                  canDelete={canDelete}
                  saving={saving}
                  saveDisabled={requiresCaptcha && !captchaOk}
                  requiresCaptcha={requiresCaptcha}
                  captchaQuestion={captchaQuestion}
                  captchaAnswer={captchaAnswer}
                  error={error}
                  onChange={(body) => {
                    setDraft((current) =>
                      current ? { ...current, body: body.slice(0, MAX_MEMO_BODY) } : current
                    );
                    setError('');
                  }}
                  onPrivateChange={(isPrivate) => {
                    setDraft((current) => (current ? { ...current, isPrivate } : current));
                  }}
                  onAnonymousChange={(isAnonymous) => {
                    setDraft((current) => (current ? { ...current, isAnonymous } : current));
                  }}
                  onCaptchaAnswer={setCaptchaAnswer}
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
  authorName,
  canWrite,
  needsReview,
  canDelete,
  saving,
  saveDisabled,
  requiresCaptcha,
  captchaQuestion,
  captchaAnswer,
  error,
  onChange,
  onPrivateChange,
  onAnonymousChange,
  onCaptchaAnswer,
  onSave,
  onClose,
  onDelete,
}: {
  map: L.Map;
  draft: Draft;
  authorName?: string | null;
  canWrite: boolean;
  needsReview?: boolean;
  canDelete: boolean;
  saving: boolean;
  saveDisabled?: boolean;
  requiresCaptcha?: boolean;
  captchaQuestion?: string;
  captchaAnswer?: string;
  error: string;
  onChange: (body: string) => void;
  onPrivateChange: (isPrivate: boolean) => void;
  onAnonymousChange: (isAnonymous: boolean) => void;
  onCaptchaAnswer: (answer: string) => void;
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
              {draft.id ? (canWrite ? 'Edit memo' : 'Memo') : 'Add a memo to the map'}
            </p>
            {authorName ? (
              <p className="text-xs text-gray-500 mt-0.5">{authorName}</p>
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
          <>
            <textarea
              value={draft.body}
              onChange={(event) => onChange(event.target.value)}
              maxLength={MAX_MEMO_BODY}
              rows={4}
              placeholder="Write your memo"
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              autoFocus
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {draft.body.length}/{MAX_MEMO_BODY}
            </p>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(draft.isPrivate)}
                onChange={(event) => onPrivateChange(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Private
            </label>
            <p className="mt-1 text-xs text-gray-500">
              {draft.isPrivate
                ? 'Only staff and you can see this memo on the map.'
                : 'This memo is visible on the public map when approved.'}
            </p>
            <label className="mt-2 flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(draft.isAnonymous)}
                onChange={(event) => onAnonymousChange(event.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Anonymous
            </label>
            <p className="mt-1 text-xs text-gray-500">
              {draft.isAnonymous
                ? 'Your name is hidden. This memo shows as Anonymous.'
                : 'Your name is shown on this memo.'}
            </p>
            {requiresCaptcha ? (
              <div className="mt-3 rounded-md border border-gray-200 bg-gray-50 p-3">
                <label className="block text-sm font-medium text-gray-800">
                  {captchaQuestion || 'Loading question…'}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={captchaAnswer || ''}
                  onChange={(event) => onCaptchaAnswer(event.target.value)}
                  placeholder="Your answer"
                  className="mt-2 w-full rounded-md border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            ) : null}
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">{draft.body}</p>
            {draft.isPrivate ? (
              <p className="mt-2 text-xs text-gray-500">Private memo</p>
            ) : null}
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-800 text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </>
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
                disabled={saving || Boolean(saveDisabled)}
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
