/**
 * Cross-view / cross-tab content sync.
 *
 * When the admin (or anything) saves CMS content, we notify other open
 * views so the public site re-fetches and reflects the change without a
 * manual reload.
 *
 * Three delivery channels for maximum coverage:
 *  - BroadcastChannel  -> other tabs (same origin), cross-tab
 *  - `storage` event   -> other tabs (fallback for older browsers)
 *  - window CustomEvent -> same tab (e.g. admin + public in one SPA session)
 * Plus the public site also re-fetches on `visibilitychange` (tab refocus),
 * which also covers out-of-band changes (e.g. Telegram bot edits).
 */

const STORAGE_KEY = 'planetup:cms-updated'
const SIGNAL = 'planetup:cms-updated'

type Unsubscribe = () => void

function hasWindow(): boolean {
  return typeof window !== 'undefined'
}

/** Call after a successful content save to notify other views/tabs. */
export function notifyContentChanged(): void {
  if (!hasWindow()) return
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  } catch {
    /* localStorage may be unavailable (private mode) — ignore */
  }
  window.dispatchEvent(new CustomEvent(SIGNAL))
  if ('BroadcastChannel' in window) {
    const ch = new BroadcastChannel(SIGNAL)
    ch.postMessage(Date.now())
    ch.close()
  }
}

/** Subscribe to content-change notifications. Returns an unsubscribe fn. */
export function onContentChanged(callback: () => void): Unsubscribe {
  if (!hasWindow()) return () => {}
  const handler = () => callback()
  window.addEventListener(SIGNAL, handler)
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) callback()
  })
  let channel: BroadcastChannel | null = null
  if ('BroadcastChannel' in window) {
    channel = new BroadcastChannel(SIGNAL)
    channel.onmessage = () => callback()
  }
  return () => {
    window.removeEventListener(SIGNAL, handler)
    window.removeEventListener('storage', handler)
    channel?.close()
  }
}
