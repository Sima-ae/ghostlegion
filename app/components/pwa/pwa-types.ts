export interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function isBeforeInstallPromptEvent(e: Event): e is BeforeInstallPromptEvent {
  return (
    'prompt' in e &&
    typeof (e as BeforeInstallPromptEvent).prompt === 'function'
  );
}
