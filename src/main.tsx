import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useMall } from './state/useMall'

// dev-only handle for automated checks
if (import.meta.env.DEV) (window as unknown as { __mall: typeof useMall }).__mall = useMall

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
