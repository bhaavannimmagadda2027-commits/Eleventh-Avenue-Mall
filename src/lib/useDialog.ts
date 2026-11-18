import { useEffect, type RefObject } from 'react'

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Keyboard behaviour for sheets and full-screen layers: move focus in when opened, Escape closes,
 * Tab stays inside (modal only), and focus returns to whatever opened it.
 */
export function useDialog(open: boolean, ref: RefObject<HTMLElement | null>, onClose: () => void, { modal = true } = {}) {
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    // wait a frame so the animated element exists
    const t = window.setTimeout(() => {
      const el = ref.current
      if (!el || el.contains(document.activeElement)) return
      const first = el.querySelector<HTMLElement>('[autofocus], ' + FOCUSABLE)
      ;(modal ? el : first ?? el).focus({ preventScroll: true })
    }, 60)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return }
      if (!modal || e.key !== 'Tab' || !ref.current) return
      const items = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null)
      if (!items.length) return
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      if (opener && document.contains(opener) && modal) opener.focus({ preventScroll: true })
    }
    // onClose is read fresh through the closure each open; re-subscribing on every render isn't needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
}
