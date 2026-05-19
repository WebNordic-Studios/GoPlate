import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AppRouter from './app/AppRouter.tsx'
import { SettingsProvider } from './state/settings'
import { ToastProvider } from './ui/Toast'
import { ErrorBoundary } from './ui/ErrorBoundary'

function routerBasename(): string | undefined {
  const baseUrl = import.meta.env.BASE_URL
  if (baseUrl === '/') return undefined
  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <SettingsProvider>
        <ToastProvider>
          <BrowserRouter basename={routerBasename()}>
            <AppRouter />
          </BrowserRouter>
        </ToastProvider>
      </SettingsProvider>
    </ErrorBoundary>
  </StrictMode>,
)
