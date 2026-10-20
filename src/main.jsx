import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isRealClerkKey = PUBLISHABLE_KEY && !PUBLISHABLE_KEY.includes('REPLACE_WITH_YOUR_KEY_HERE') && (PUBLISHABLE_KEY.startsWith('pk_test_') || PUBLISHABLE_KEY.startsWith('pk_live_'));

const appContent = (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

createRoot(document.getElementById('root')).render(
  isRealClerkKey ? (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {appContent}
    </ClerkProvider>
  ) : (
    appContent
  )
);
