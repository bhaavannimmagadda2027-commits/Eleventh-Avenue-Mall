import * as THREE from 'three'
import { AD_BY_ID } from '../data/advertisements'
import { adTex } from './textures'
import { reduceMotion } from './input'

/**
 * Small digital screens that rotate between campaigns. Each change is a short, quiet dim-and-swap,
 * never a flash or motion that pulls attention from shopping.
 */
type Screen = { meshes: THREE.Mesh[]; ids: string[]; w: number; h: number; i: number; t: number; fade: number; swapped: boolean }
const SCREENS: Screen[] = []
const PERIOD = 7 // seconds per campaign
const FADE = 0.5 // seconds for the whole dim-and-swap

export function registerScreen(meshes: THREE.Mesh[], ids: string[], px: [number, number], offset = 0) {
  const s: Screen = { meshes, ids, w: px[0], h: px[1], i: 0, t: offset, fade: -1, swapped: false }
  meshes.forEach((m) => { m.userData.adId = ids[0] })
  SCREENS.push(s)
}

export function tickScreens(dt: number) {
  for (const s of SCREENS) {
    if (s.ids.length < 2) continue
    // only animate screens that are actually on display
    if (!s.meshes.some((m) => isShown(m))) continue
    s.t += dt
    if (s.fade < 0 && s.t > PERIOD) { s.fade = 0; s.swapped = false; s.t = 0 }
    if (s.fade < 0) continue
    s.fade += dt / (reduceMotion ? 0.01 : FADE)
    const k = s.fade < 0.5 ? s.fade * 2 : (1 - s.fade) * 2 // 0 → 1 → 0
    if (s.fade >= 0.5 && !s.swapped) {
      s.i = (s.i + 1) % s.ids.length
      const ad = AD_BY_ID[s.ids[s.i]]
      const tex = adTex(ad, s.w, s.h)
      s.meshes.forEach((m) => { (m.material as THREE.MeshBasicMaterial).map = tex; m.userData.adId = ad.id })
      s.swapped = true
    }
    const level = 1 - Math.max(0, Math.min(1, k)) * 0.35
    s.meshes.forEach((m) => (m.material as THREE.MeshBasicMaterial).color.setScalar(level))
    if (s.fade >= 1) { s.fade = -1; s.meshes.forEach((m) => (m.material as THREE.MeshBasicMaterial).color.setScalar(1)) }
  }
}

function isShown(o: THREE.Object3D | null): boolean {
  while (o) { if (!o.visible) return false; o = o.parent }
  return true
}
