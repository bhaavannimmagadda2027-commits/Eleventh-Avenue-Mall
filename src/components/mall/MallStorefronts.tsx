import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { L } from '../../data/layout'
import type { Store } from '../../data/stores'
import { useCurrentMall, useMall } from '../../state/useMall'
import { bladeTex, facadeTex, signTex, soonTex, upperFacadeTex } from '../../lib/textures'
import { M, basic, box, enableShadows, findTag, plane, mergeStatic } from './build'

const SHOP_W = 8.0

function buildStorefronts(stores: Store[]) {
  const g = new THREE.Group()
  ;[-1, 1].forEach((side) => {
    L.slots.forEach((z) => {
      ;[0, 1].forEach((level) => {
        const st = stores.find((s) => s.side === side && s.level === level && s.z === z) ?? null
        const unit = new THREE.Group()
        unit.position.set(side * (L.shopX - 0.02), level ? L.upperY : 0, z)
        unit.rotation.y = -side * Math.PI / 2 // face the atrium
        g.add(unit)
        if (st) unit.userData.storeId = st.id
        if (level === 0) {
          const H = 3.6
          const face = plane(SHOP_W, H, basic(st ? facadeTex(st) : soonTex()), unit)
          face.position.y = H / 2
          face.userData.noShadow = true
          // sign band (text-only fascia) sitting slightly proud of the wall
          box(SHOP_W + 0.2, 0.7, 0.16, M.stone(), 0, H + 0.42, 0.06, unit)
          if (st) {
            const sign = plane(SHOP_W * 0.72, (SHOP_W * 0.72) / 8, basic(signTex(st), { toneMapped: false }), unit)
            sign.position.set(0, H + 0.42, 0.15)
          }
          // pale oak threshold + brushed aluminium door frame
          box(SHOP_W, 0.04, 0.5, M.oak(), 0, 0.02, 0.25, unit).userData.noCast = true
          box(0.06, H, 0.08, M.alu(), -1.17, H / 2, 0.04, unit)
          box(0.06, H, 0.08, M.alu(), 1.17, H / 2, 0.04, unit)
          // blade sign projecting into the walkway so the store reads from down the mall
          if (st) {
            const blade = new THREE.Group()
            blade.position.set(SHOP_W / 2 - 0.25, 3.15, 0.95)
            blade.rotation.y = Math.PI / 2
            unit.add(blade)
            box(1.5, 0.46, 0.06, M.white(), 0, 0, 0, blade)
            ;[1, -1].forEach((k) => {
              const p = plane(1.42, 0.4, basic(bladeTex(st), { toneMapped: false }), blade)
              p.position.z = k * 0.032
              if (k < 0) p.rotation.y = Math.PI
            })
          }
        } else {
          const H = 2.6
          const face = plane(SHOP_W, H, basic(upperFacadeTex(st, `${side}${z}`)), unit)
          face.position.y = 0.25 + H / 2
          face.userData.noShadow = true
          box(SHOP_W + 0.2, 0.6, 0.14, M.stone(), 0, 0.25 + H + 0.38, 0.05, unit)
          if (st) {
            const sign = plane(SHOP_W * 0.6, (SHOP_W * 0.6) / 8, basic(signTex(st), { toneMapped: false }), unit)
            sign.position.set(0, 0.25 + H + 0.38, 0.13)
          }
        }
      })
    })
  })
  enableShadows(g)
  mergeStatic(g)
  return g
}

export function MallStorefronts() {
  const mall = useCurrentMall()
  const group = useMemo(() => buildStorefronts(mall.stores), [mall])
  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return
    const tag = findTag(e.object)
    if (!tag?.storeId) return
    e.stopPropagation()
    const st = mall.stores.find((s) => s.id === tag.storeId)
    if (!st) return
    if (st.level === 0) useMall.getState().travelTo(st.id)
    else useMall.getState().open({ kind: 'store', id: st.id })
  }
  return <primitive object={group} onClick={onClick} />
}
