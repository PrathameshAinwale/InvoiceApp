import { BrowserRouter }  from 'react-router-dom';
import AppRouter          from './routes/AppRouter';
import './App.css';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';   // ← add this import
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
const App = () => {
   useEffect(() => {
    const setStatusBar = async () => {
      // ← only run on native iOS/Android, skip on web
      if (!Capacitor.isNativePlatform()) return;

      await StatusBar.setOverlaysWebView({ overlay: false });
      await StatusBar.setStyle({ style: Style.Default });
    };
    setStatusBar();
  }, []);
  return (
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
 
  );
};

export default App;