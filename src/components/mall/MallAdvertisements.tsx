import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { registerScreen } from '../../lib/adRotation'
import { L, addCircle } from '../../data/layout'
import { AD_BY_ID } from '../../data/advertisements'
import { STORE_BY_ID } from '../../data/stores'
import { useMall } from '../../state/useMall'
import { adTex } from '../../lib/textures'
import { M, basic, box, enableShadows, findTag, plane, mergeStatic } from './build'

function panel(parent: THREE.Object3D, adId: string, w: number, h: number, px: number, py: number) {
  const ad = AD_BY_ID[adId]
  const p = plane(w, h, basic(adTex(ad, px, py)), parent)
  p.userData.adId = adId
  return p
}

/**
 * Advertising as part of the architecture: two stone pillars by the fountain, slim promo panels beside
 * storefronts, small overhead screens under the bridge and one brand installation on the bridge rail.
 * Each occupies a small area; none blocks a walkway or a product.
 */
export function MallAdvertisements() {
  const { group } = useMemo(() => {
    const g = new THREE.Group()

    // pillars
    ;[
      { x: -3.4, z: -11.2, front: ['bb-fresh', 'zudio-school', 'wh-table'], back: ['croma-anc', 'croma-laptop'] },
      { x: 3.4, z: -11.2, front: ['palette-serum', 'palette-scent', 'neu-coins'], back: ['titan-new', 'bb-breakfast'] },
    ].forEach(({ x, z, front, back }, n) => {
      const p = new THREE.Group()
      p.position.set(x, 0, z)
      g.add(p)
      box(0.78, 2.5, 0.3, M.stone(), 0, 1.25, 0, p)
      box(0.82, 0.08, 0.34, M.oak(), 0, 2.54, 0, p)
      const f = panel(p, front[0], 0.62, 1.36, 300, 660)
      f.position.set(0, 1.45, 0.152)
      registerScreen([f], front, [300, 660], n * 2.3 + 1)
      const b = panel(p, back[0], 0.62, 1.36, 300, 660)
      registerScreen([b], back, [300, 660], n * 2.3 + 4.5)
      b.position.set(0, 1.45, -0.152)
      b.rotation.y = Math.PI
      addCircle({ x, z, r: 0.5 })
    })

    // slim promotional panels standing beside storefront doors
    ;[
      { store: 'croma', ad: 'croma-anc' },
      { store: 'palette', ad: 'palette-serum' },
      { store: 'starbucks', ad: 'sbux-cold' },
    ].forEach(({ store, ad }) => {
      const st = STORE_BY_ID[store]
      const u = new THREE.Group()
      u.position.set(st.side * (L.shopX - 0.45), 0, st.z + 2.6)
      u.rotation.y = -st.side * Math.PI / 2
      g.add(u)
      box(0.72, 1.62, 0.06, M.alu(), 0, 0.95, 0, u)
      panel(u, ad, 0.64, 1.42, 300, 660).position.set(0, 0.97, 0.035)
    })

    // small overhead screens hanging under the bridge (rotate between two campaigns)
    ;[
      { x: -4.6, ids: ['sbux-cold', 'titan-new'] },
      { x: 4.6, ids: ['croma-anc', 'bb-fresh'] },
    ].forEach(({ x, ids }) => {
      const u = new THREE.Group()
      u.position.set(x, 3.55, L.bridgeZ + 2.25)
      g.add(u)
      box(1.5, 0.84, 0.08, M.white(), 0, 0, 0, u)
      ;[-0.4, 0.4].forEach((k) => box(0.015, 0.45, 0.015, M.alu(), k, 0.64, 0, u))
      const s = panel(u, ids[0], 1.38, 0.72, 690, 360)
      s.position.z = 0.045
      registerScreen([s], ids, [690, 360], x > 0 ? 3.5 : 0)
    })

    // brand installation on the bridge's far rail
    const inst = new THREE.Group()
    inst.position.set(0, L.upperY + 1.55, L.bridgeZ - 2.15)
    g.add(inst)
    box(3.5, 0.92, 0.06, M.white(), 0, 0, 0, inst)
    panel(inst, 'neu-coins', 3.36, 0.8, 1260, 300).position.z = 0.035

    enableShadows(g)
    mergeStatic(g)
    return { group: g }
  }, [])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return
    const tag = findTag(e.object)
    if (!tag?.adId) return
    e.stopPropagation()
    useMall.getState().open({ kind: 'ad', id: tag.adId as string })
  }
  return <primitive object={group} onClick={onClick} />
}
