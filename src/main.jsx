import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import './index.css'
import './App.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey='6LdckQIkAAAAAIti_aaT_fPhD3knm7R3qyfeysc8'>
      <App />
    </GoogleReCaptchaProvider>
  </StrictMode>,
)
