import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css'; // Asegúrate de que esta sea la ruta correcta para tu archivo CSS

const Auth = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  // Definir los endpoints para el registro e inicio de sesión
  const API_BASE_URL = 'https://apimongo-3.onrender.com/api/auth'; // Cambia esto según tu configuración
  const REGISTER_ENDPOINT = `${API_BASE_URL}/register`;
  const LOGIN_ENDPOINT = `${API_BASE_URL}/login`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isRegistering ? REGISTER_ENDPOINT : LOGIN_ENDPOINT;
    console.log('Enviando solicitud:', { username, password });

    try {
      const response = await axios.post(endpoint, { username, password });
      console.log('Respuesta del backend:', response.data);

      if (isRegistering) {
        toast.success('Registro exitoso');
      } else {
        toast.success('Inicio de sesión exitoso');
        onLoginSuccess(); // Llama a la función del padre para indicar el inicio de sesión exitoso
        navigate('/monitor'); // Redirige a /monitor
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      const errorMessage = error.response?.data?.error || 'Error en la solicitud';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="auth-monitor-container">
      <div className="auth-card">
        <h2>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            className="input-field"
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn primary-btn" type="submit">
            {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
          </button>
        </form>
        <button className="toggle-link" onClick={() => setIsRegistering(!isRegistering)}>
          {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

// Exporta el componente
export default Auth;
