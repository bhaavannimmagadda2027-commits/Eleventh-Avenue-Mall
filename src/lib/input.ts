// Driving input shared between the DOM joystick / keyboard and the 3D frame loop.
// Kept outside React state so steering never triggers re-renders.
export const drive = {
  jx: 0, // -1 left .. 1 right
  jy: 0, // -1 back .. 1 forward
  keys: {} as Record<string, boolean>,
  /** set when the user drags the scene to look around */
  lookDelta: 0,
}

export function readSteer() {
  let { jx, jy } = drive
  const k = drive.keys
  if (k.ArrowUp || k.KeyW) jy = 1
  if (k.ArrowDown || k.KeyS) jy = -1
  if (k.ArrowLeft || k.KeyA) jx = -1
  if (k.ArrowRight || k.KeyD) jx = 1
  return { jx, jy }
}

export const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
