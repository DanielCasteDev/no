import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Monitor from './monitor';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    console.log("Login fue exitoso, cambiando el estado a 'true'");
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/monitor" element={isLoggedIn ? <Monitor /> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
