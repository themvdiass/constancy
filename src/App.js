import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import LoadProgression from './LoadProgression';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Detectar preferência de tema do sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Definir tema inicial
    setDarkMode(mediaQuery.matches);
    
    // Listener para mudanças em tempo real
    const handleChange = (e) => {
      setDarkMode(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    // Aplicar classe dark-mode no documento
    if (darkMode) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#2d2d2d');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff');
    }
  }, [darkMode]);

  return (
    <Router 
      basename={process.env.PUBLIC_URL}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Routes>
        <Route path="/" element={<Home darkMode={darkMode} />} />
        <Route path="/progressao-de-carga" element={<LoadProgression darkMode={darkMode} />} />
        <Route path="/adicionar-exercicio" element={<LoadProgression darkMode={darkMode} addMode={true} />} />
      </Routes>
    </Router>
  );
}

export default App;
