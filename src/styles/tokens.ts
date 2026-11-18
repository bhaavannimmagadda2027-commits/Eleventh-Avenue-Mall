// Design tokens for code that can't read CSS variables (Three.js materials, canvas textures).
// Keep in sync with src/index.css.
export const color = {
  bg: '#FAF9F6',
  white: '#FFFFFF',
  cream: '#F6F3ED',
  soft: '#EAE9E5',
  floor: '#D9D9D4',
  oak: '#D9C5A5',
  wood: '#BFA887',
  ink: '#262626',
  ink2: '#777873',
  purple: '#7665B5',
  purpleSoft: '#EAE5F6',
  green: '#7C9877',
  success: '#57865D',
  promo: '#E89A50',
  // architecture
  stone: '#F2EEE6',
  plaster: '#F7F4EE',
  aluminium: '#C9CBCC',
  beam: '#FBFBF9',
  leaf: ['#7C9877', '#6E8B69', '#8FA889', '#647F60'],
} as const

export const font = {
  family: 'Inter, "Segoe UI", system-ui, sans-serif',
} as const
