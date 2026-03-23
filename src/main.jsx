import "./i18n/i18n.js"
import { createRoot } from 'react-dom/client' 
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import "./styles/themes.css"
import { ThemeProvider } from './context/ThemeContext.jsx'



createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <ThemeProvider>
  <App />
  </ThemeProvider>
  </BrowserRouter>
)
