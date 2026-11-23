import { useEffect, useRef, useState } from 'react'
import { drive } from '../../lib/input'

const R = 34 // knob travel in px

/** Translucent joystick, bottom-left. Releasing it lets the cart coast to a stop. */
export function CartJoystick() {
  const base = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0, active: false })
  const pid = useRef<number | null>(null)

  const update = (e: React.PointerEvent) => {
    const r = base.current!.getBoundingClientRect()
    let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2)
    const d = Math.hypot(dx, dy)
    if (d > R) { dx = (dx / d) * R; dy = (dy / d) * R }
    drive.jx = Math.abs(dx / R) < 0.12 ? 0 : dx / R
    drive.jy = -dy / R
    setKnob({ x: dx, y: dy, active: true })
  }
  const end = (e: React.PointerEvent) => {
    if (e.pointerId !== pid.current) return
    pid.current = null
    drive.jx = 0
    drive.jy = 0
    setKnob({ x: 0, y: 0, active: false })
  }

  // keyboard: arrows / WASD
  useEffect(() => {
    const codes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD']
    const kd = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      // typing, or a sheet / checkout is open: arrows belong to that, not to driving
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || document.querySelector('[aria-modal="true"]')) return
      if (codes.includes(e.code)) { drive.keys[e.code] = true; e.preventDefault() }
    }
    const ku = (e: KeyboardEvent) => { drive.keys[e.code] = false }
    const blur = () => { drive.keys = {} }
    window.addEventListener('keydown', kd)
    window.addEventListener('keyup', ku)
    window.addEventListener('blur', blur)
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('blur', blur); drive.keys = {} }
  }, [])

  const dir = Math.hypot(knob.x, knob.y) > 6 ? Math.atan2(knob.y, knob.x) : null

  return (
    <div
      ref={base}
      role="application"
      aria-label="Joystick: drag to drive NEU CART. Arrow keys or W A S D also work."
      className="relative h-[104px] w-[104px] shrink-0 touch-none select-none rounded-full border border-white/70 bg-white/25 shadow-[0_8px_24px_-10px_rgb(0_0_0/0.5)] backdrop-blur-md"
      onPointerDown={(e) => { pid.current = e.pointerId; base.current!.setPointerCapture(e.pointerId); update(e) }}
      onPointerMove={(e) => { if (e.pointerId === pid.current) update(e) }}
      onPointerUp={end}
      onPointerCancel={end}
    >
      {dir !== null && (
        <div
          className="absolute left-1/2 top-1/2 h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: `conic-gradient(from ${dir + Math.PI / 2 - 0.5}rad, rgb(167 150 232 / 0.4) 0 1rad, transparent 1rad)` }}
        />
      )}
      {[0, 90, 180, 270].map((a) => (
        <svg key={a} viewBox="0 0 12 8" className="absolute left-1/2 top-1/2 h-2 w-3 text-white" style={{ transform: `translate(-50%,-50%) rotate(${a}deg) translateY(-42px)` }} aria-hidden><path d="M1 7 L6 2 L11 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      ))}
      <div
        className="absolute left-1/2 top-1/2 h-[46px] w-[46px] rounded-full bg-white shadow-[0_6px_14px_-4px_rgb(0_0_0/0.6)]"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))`, transition: knob.active ? 'none' : 'transform 260ms var(--ease-calm)' }}
      >
      </div>
    </div>
  )
}
