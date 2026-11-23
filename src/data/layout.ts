// World layout of the galleria lobby (metres). -z runs from the entrance into the mall.
export const L = {
  entranceZ: 8, // glass entrance facade
  endZ: -135, // far glass wall
  voidHalf: 7.4, // half-width of the open atrium under the glass roof
  shopX: 11, // ground and upper storefront line
  upperY: 4.8, // first-floor level
  slabT: 0.42,
  eaveY: 11.4,
  ridgeY: 15.6,
  columnStep: 9, // structural rhythm along z
  spawn: { x: 0, z: 3.2, yaw: 0 },
  // ground/upper storefront slots (centres between columns)
  slots: [-4.5, -13.5, -22.5, -31.5, -40.5, -49.5, -58.5, -67.5, -76.5, -85.5, -94.5, -103.5, -112.5, -121.5],
  fountain: { x: 0, z: -7, r: 1.75 },
  escalators: { z0: -25, z1: -33, x: 1.35 },
  bridgeZ: -35.2,
  lounges: [-16.5, -47, -78, -109],
  edgeTrees: [0, -27, -54, -81, -108, -126],
}

export type Circle = { x: number; z: number; r: number }
export type Rect = { x0: number; x1: number; z0: number; z1: number }

// Ground-level obstacles for NEU CART collisions, one set per location (lobby, each store)
export type Obstacles = { circles: Circle[]; rects: Rect[] }
export const OBSTACLES: Record<string, Obstacles> = { lobby: { circles: [], rects: [] } }
export const obstacles = OBSTACLES.lobby
export const obstaclesOf = (loc: string): Obstacles => (OBSTACLES[loc] ??= { circles: [], rects: [] })
export function addCircle(c: Circle, loc = 'lobby') { obstaclesOf(loc).circles.push(c) }
export function addRect(r: Rect, loc = 'lobby') { obstaclesOf(loc).rects.push(r) }
