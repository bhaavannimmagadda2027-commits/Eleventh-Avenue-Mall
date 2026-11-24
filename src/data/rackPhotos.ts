/**
 * Shelf racks built from front-on photographs, one photo per aisle section.
 *
 * Each photo is one rack, shot straight on. All measurements are in photo pixels:
 * `lips` are the shelf edges from top to bottom (top of the shelf surface, bottom of the lip).
 * Taps: `order` lists the products in the photo's equal vertical blocks from left to right
 * (the run's own product order when left out), or `blocks` gives explicit block edges per shelf row.
 * A block with a null id is stock the catalogue does not carry yet, so tapping it does nothing.
 */
import { GEN } from './rackPhotos.gen'

export type RackPhoto = {
  src: string
  w: number
  h: number
  /** oak frame width on the left and right, and the top rail height */
  frame: [number, number, number]
  lips: [number, number][]
  order?: string[]
  blocks?: [number, number, string | null][][]
  oak: string
  shelf: string
  /** every item cut out of the photo by scripts/rack-3d.py: [row, x0, x1, y0, y1, round] */
  packs?: [number, number, number, number, number, number][]
  /** the colour of the back panel behind the items */
  bg?: string
}

/** Photos keyed by `hall/section`; scripts/rack-photo.py writes them into rackPhotos.gen.ts. */
export const SECTION_PHOTOS: Record<string, RackPhoto> = { ...GEN }
