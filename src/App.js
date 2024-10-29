import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function AuthAndMonitor() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logs, setLogs] = useState([]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:4001/api/auth/register', { username, password });
      toast.success('Usuario registrado con éxito 🎉');
    } catch (error) {
      toast.error('Error al registrar usuario 😢');
    }
  };

  const handleDetectChanges = async () => {
    try {
      const response = await axios.get('http://localhost:4001/api/auth/verificar-cambios');
      const { mensaje, alerta, cambios } = response.data;

      if (alerta) {
        toast.warn(alerta);
        console.log('Cambios detectados:', cambios);
      } else {
        toast.success(mensaje);
      }
    } catch (error) {
      toast.error('Error al verificar cambios 🔍');
    }
  };

  const handleGetLogs = async () => {
    try {
      const response = await axios.get('http://localhost:4001/api/auth/logs');
      setLogs(response.data);
      toast.info('Logs obtenidos correctamente 📝');
    } catch (error) {
      toast.error('Error al obtener los logs 📄');
    }
  };

  return (
    <div className="auth-monitor-container">
      <ToastContainer position="top-center" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover draggable />

      <div className="auth-card">
        <h2>Registro</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input-field"
        />
        <div className="password-container">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field password-input"
          />
          <span className="password-toggle" onClick={togglePasswordVisibility}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button className="btn primary-btn" onClick={handleRegister}>Registrar</button>
      </div>

      <div className="auth-card">
        <h2>Monitoreo de Base de Datos</h2>
        <button className="btn action-btn" onClick={handleDetectChanges}>Verificar Cambios</button>
        <button className="btn action-btn" onClick={handleGetLogs}>Auditoría</button>
      </div>

      {logs.length > 0 && (
        <div className="logs-container">
          <h2>Logs de Auditoría</h2>
          <table className="logs-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Datos Afectados</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.fecha).toLocaleString()}</td>
                  <td>{log.descripcion}</td>
                  <td>{log.datos_afectados.map((d) => d.usuario).join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AuthAndMonitor;
