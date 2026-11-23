import { useEffect, useLayoutEffect, useRef } from 'react'
import { FriendMarkers } from '../social/FriendMarkers'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useThree } from '@react-three/fiber'
import { CartRig, devDt } from '../cart/CartRig'
import { useFrame } from '@react-three/fiber'
import { tickScreens } from '../../lib/adRotation'
import { MallArchitecture } from './MallArchitecture'
import { MallStorefronts } from './MallStorefronts'
import { MallDirectory } from './MallDirectory'
import { MallAdvertisements } from './MallAdvertisements'
import { Fountain } from './Fountain'
import { WayChevrons } from './WayChevrons'
import { Escalators } from './Escalators'
import { Greenery } from './Greenery'
import { MarketStalls } from './MarketStalls'
import { EntranceMat, Shoppers, SunRays } from './Ambience'
import { StoreInterior } from '../store/StoreInterior'
import { HALLS, HALL_IDS } from '../../data/storeLayout'
import { useMall } from '../../state/useMall'
import { setReflections } from '../../lib/quality'

/** 11 am daylight: soft sky fill, a warm sun through the glass roof, gentle reflections. */
const MOOD = {
  neutral: { sky: '#FFF8EC', sun: '#FFF0DA' },
  warm: { sky: '#FFF4E6', sun: '#FFEACF' }, // beauty, home: a touch warmer
  cool: { sky: '#F8F8F4', sun: '#FFF6E8' }, // electronics: a little cooler
}

function MallLighting({ sun }: { sun: React.RefObject<THREE.DirectionalLight | null> }) {
  const sky = useRef<THREE.HemisphereLight>(null)
  const loc = useMall((s) => s.location)
  useEffect(() => {
    const mood = MOOD[HALLS[loc]?.light ?? 'neutral']
    sky.current?.color.set(mood.sky)
    sun.current?.color.set(mood.sun)
  }, [loc, sun])
  return (
    <>
      <hemisphereLight ref={sky} args={['#FFF8EC', '#DCC6A6', 1.08]} />
      <directionalLight
        ref={sun}
        color="#FFF0DA"
        intensity={1.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.03}
        shadow-radius={3}
        shadow-intensity={0.42}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
      <directionalLight color="#F3EEFF" intensity={0.35} position={[-8, 10, -20]} />
    </>
  )
}

/** Only the place you're in is drawn: the lobby, or the store you walked into. */
function Locations() {
  const loc = useMall((s) => s.location)
  const root = useRef<THREE.Group>(null)
  // printed signs and facades ignore scene lights, so give them the same soft daylight cast
  useLayoutEffect(() => {
    const seen = new Set<THREE.Material>()
    root.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined
      if (!m || Array.isArray(m) || seen.has(m) || !m.isMeshBasicMaterial || !m.map || !m.fog || !m.toneMapped) return
      seen.add(m)
      m.color.set('#F7F2E9')
    })
  }, [])
  return (
    <group ref={root}>
      <group visible={loc === 'lobby'}>
        <MallArchitecture />
        <MallStorefronts />
        <MallDirectory />
        <MallAdvertisements />
        <Fountain />
        <Escalators />
        <Greenery />
        <MarketStalls />
        <SunRays />
        <Shoppers />
        <EntranceMat />
      </group>
      {HALL_IDS.map((id) => (
        <group key={id} visible={loc === id}>
          <StoreInterior id={id} />
        </group>
      ))}
    </group>
  )
}

/** Drives every rotating ad screen from one frame callback. */
function AdTicker() {
  useFrame((_, dt) => tickScreens(Math.min(0.05, dt)))
  return null
}

/**
 * Keeps the mall smooth on modest phones and saves battery:
 * - if frames average slower than ~45 fps for two seconds, render at a lower pixel ratio (never below 1),
 *   then turn off floor reflections if that is not enough;
 * - while the checkout covers the whole screen, stop rendering the 3D scene altogether.
 */
function PerfGovernor() {
  const setDpr = useThree((s) => s.setDpr)
  const setFrameloop = useThree((s) => s.setFrameloop)
  const acc = useRef({ t: 0, n: 0, dpr: Math.min(2, window.devicePixelRatio || 1) })
  useFrame((_, dt) => {
    const a = acc.current
    if (dt > 0.25) return // tab was in the background
    a.t += dt; a.n++
    if (a.t < 2) return
    const avg = a.t / a.n
    if (avg > 1 / 45 && a.dpr > 1) { a.dpr = Math.max(1, +(a.dpr - 0.25).toFixed(2)); setDpr(a.dpr) }
    // already at the lowest pixel ratio and still slow: drop the floor reflections
    else if (avg > 1 / 40) setReflections(false)
    a.t = 0; a.n = 0
  })
  useEffect(() => {
    let timer = 0
    const unsub = useMall.subscribe((s, p) => {
      if (s.checkout === p.checkout) return
      window.clearTimeout(timer)
      if (s.checkout === 'closed') setFrameloop('always')
      // wait until the checkout has finished sliding over the scene
      else timer = window.setTimeout(() => setFrameloop('never'), 500)
    })
    return () => { unsub(); window.clearTimeout(timer) }
  }, [setFrameloop])
  return null
}

function DevHook() {
  const advance = useThree((s) => s.advance)
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  if (import.meta.env.DEV) {
    ;(window as unknown as Record<string, unknown>).__step = (n = 1) => {
      devDt.fixed = 1 / 30
      for (let i = 0; i < n; i++) advance(performance.now() + i * 33)
      devDt.fixed = 0
    }
    ;(window as unknown as Record<string, unknown>).__gl = gl
    ;(window as unknown as Record<string, unknown>).__scene = scene
    ;(window as unknown as Record<string, unknown>).__cam = camera
  }
  return null
}

export function MallEnvironment() {
  const sun = useRef<THREE.DirectionalLight>(null)
  const frozen = useMall((m) => m.sceneFrozen)
  return (
    <Canvas
      className="!absolute inset-0 touch-none"
      role="img"
      aria-label="3D view of the mall. Drive NEU CART with the joystick or the arrow keys; stores, shelves and ads can be tapped. Every action is also available from the menus."
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 2]}
      frameloop={frozen ? 'never' : 'always'}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ fov: 62, near: 0.05, far: 260, position: [0, 3.9, 6.6] }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.02
        scene.background = new THREE.Color('#E4F0F5')
        scene.fog = new THREE.Fog('#F8EFE2', 58, 150)
        const pmrem = new THREE.PMREMGenerator(gl)
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
        scene.environmentIntensity = 0.62
      }}
    >
      <MallLighting sun={sun} />
      <Locations />
      <CartRig sun={sun} />
      <WayChevrons />
      <FriendMarkers />
      <AdTicker />
      <PerfGovernor />
      {import.meta.env.DEV && <DevHook />}
    </Canvas>
  )
}
