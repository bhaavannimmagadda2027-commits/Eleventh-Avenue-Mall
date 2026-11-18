import { TATA_STORES, type Store } from './stores'

// Each conglomerate gets its own mall on the same platform. Only one is built in this prototype;
// adding another means adding a store list and identity here, not new UI.
export type Mall = {
  id: string
  name: string
  group: string
  city: string
  initial: string
  tone: string
  stores: Store[]
  available: boolean
}

export const MALLS: Mall[] = [
  { id: 'tata', name: 'Tata Mall', group: 'Tata Group', city: 'Bengaluru', initial: 'T', tone: '#2F5D8A', stores: TATA_STORES, available: true },
  { id: 'reliance', name: 'Reliance Mall', group: 'Reliance', city: 'Mumbai', initial: 'R', tone: '#8A6A2F', stores: [], available: false },
  { id: 'birla', name: 'Birla Mall', group: 'Aditya Birla Group', city: 'Delhi', initial: 'B', tone: '#8A2F3E', stores: [], available: false },
]
