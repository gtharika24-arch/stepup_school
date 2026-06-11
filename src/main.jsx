import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initDB, setupSyncListener, processSyncQueue } from './db.js'

// Initialize IndexedDB
initDB().catch(err => {
  console.error('Failed to initialize database:', err)
})

// Setup offline/online listeners
setupSyncListener()

// Service worker registration is disabled in development to avoid stale cached UI.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      return Promise.all(registrations.map((registration) => registration.unregister()))
    }).then(() => {
      if (import.meta.env.PROD) {
        return navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration)

            registration.addEventListener('updatefound', () => {
              const installingWorker = registration.installing
              if (!installingWorker) return

              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  window.location.reload()
                }
              })
            })

            setInterval(() => {
              registration.update()
            }, 60000)
          })
      }
    }).catch((err) => {
      console.error('❌ Service Worker setup failed:', err)
    })
  })
}

// Process any queued sync requests on app start
window.addEventListener('load', () => {
  processSyncQueue()
})

// Show online/offline status in console
window.addEventListener('online', () => {
  console.log('🟢 You are online')
  // Trigger data sync
  processSyncQueue()
})

window.addEventListener('offline', () => {
  console.log('🔴 You are offline - changes will sync when back online')
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)