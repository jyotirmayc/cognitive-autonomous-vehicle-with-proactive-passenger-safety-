import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { TelemetryProvider } from './TelemetryContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TelemetryProvider>
      <App />
    </TelemetryProvider>
  </StrictMode>,
)
