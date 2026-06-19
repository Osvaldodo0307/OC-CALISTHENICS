import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import Analytics from './components/Analytics.tsx'
import UtmCapture from './components/UtmCapture.tsx'
import { runtime } from './config/runtime.ts'
import './index.css'
import './styles/mobile.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {!runtime.isAppMode && (
      <>
        <Analytics />
        <UtmCapture />
      </>
    )}
    <App />
  </React.StrictMode>,
)
