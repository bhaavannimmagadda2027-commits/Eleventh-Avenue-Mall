import { useMemo } from 'react'
import * as THREE from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { addCircle } from '../../data/layout'
import { useCurrentMall, useMall } from '../../state/useMall'
import { blobTex, directoryTex } from '../../lib/textures'
import { M, basic, box, enableShadows, plane } from './build'

/** Free-standing stone directory near the entrance, like real mall signage. */
export function MallDirectory({ x = -3.6, z = 0.4, rot = 0.42 }: { x?: number; z?: number; rot?: number }) {
  const mall = useCurrentMall()
  const group = useMemo(() => {
    const g = new THREE.Group()
    g.position.set(x, 0, z)
    g.rotation.y = rot
    g.userData.directory = true
    box(1.25, 2.45, 0.26, M.stone(), 0, 1.3, 0, g)
    box(1.31, 0.08, 0.32, M.oak(), 0, 2.56, 0, g)
    box(1.1, 0.06, 0.4, M.alu(), 0, 0.03, 0, g)
    const face = plane(1.06, 2.12, basic(directoryTex(mall.stores)), g)
    face.position.set(0, 1.34, 0.132)
    const back = plane(1.06, 2.12, basic(directoryTex(mall.stores)), g)
    back.position.set(0, 1.34, -0.132)
    back.rotation.y = Math.PI
    const shadow = plane(2.2, 1.2, new THREE.MeshBasicMaterial({ map: blobTex(), transparent: true, depthWrite: false, opacity: 0.55 }), g)
    shadow.rotation.x = -Math.PI / 2
    shadow.position.y = 0.006
    shadow.userData.noShadow = true
    enableShadows(g)
    addCircle({ x, z, r: 0.75 })
    return g
  }, [mall, x, z, rot])

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    if (e.delta > 8) return
    e.stopPropagation()
    useMall.getState().open({ kind: 'directory' })
  }
  return <primitive object={group} onClick={onClick} />
}
