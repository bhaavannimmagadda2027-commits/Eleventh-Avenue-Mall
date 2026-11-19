/**
 * Render-quality switches shared by the scene. Floor reflections cost a second render of the store,
 * so they start on for desktops and strong phones, and the frame-rate governor can turn them off.
 */
const coarse = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches
const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 4 : 4

export const quality = { reflections: !coarse || cores >= 8 }
const listeners = new Set<() => void>()

export function onQuality(f: () => void) {
  listeners.add(f)
  return () => listeners.delete(f)
}

export function setReflections(on: boolean) {
  if (quality.reflections === on) return
  quality.reflections = on
  listeners.forEach((f) => f())
}
