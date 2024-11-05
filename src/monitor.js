import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Swal from 'sweetalert2';
import './monitor.css';

function Monitor() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUsersListModal, setShowUsersListModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [errors, setErrors] = useState({ username: '', password: '' });
  const usersPerPage = 5;
  const logsPerPage = 5;

  useEffect(() => {
    fetchUsers();
    fetchLogs();
  }, []);

  // Fetch users
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://apimongo-3.onrender.com/api/auth/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Error al obtener los usuarios');
    }
  };

  // Fetch logs
  const fetchLogs = async () => {
    try {
      const response = await axios.get('https://apimongo-3.onrender.com/api/auth/logs');
      const logsWithSeverity = response.data.map(log => {
        let severidad = 'sin-importancia';
        if (log.descripcion.includes('actualizado')) {
          severidad = 'importante';
        } else if (log.descripcion.includes('cambios')) {
          severidad = 'severo';
        }

        return { ...log, severidad };
      });
      setLogs(logsWithSeverity);
    } catch (error) {
      toast.error('Error al obtener logs');
    }
  };

  // Validate form before user creation or update
  const validateForm = () => {
    const errors = {};
    if (!newUser.username.trim()) {
      errors.username = 'El nombre de usuario es obligatorio';
    }
    if (!newUser.password) {
      errors.password = 'La contraseña es obligatoria';
    } else if (newUser.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create or update user
 const handleSaveUser = async () => {
  if (!validateForm()) {
    toast.error('Por favor corrige los errores en el formulario');
    return;
  }

  try {
    if (currentUserId) {
      // Actualizar usuario
      console.log('Actualizando usuario con ID:', currentUserId);
      console.log('Datos a actualizar:', newUser); // Verificar qué datos se están enviando

      const response = await axios.put(`https://apimongo-3.onrender.com/api/auth/users/${currentUserId}`, newUser);
      toast.success(response.data.message);
      console.log('Respuesta del servidor:', response.data);
    } else {
      // Crear usuario
      const response = await axios.post('https://apimongo-3.onrender.com/api/auth/register', newUser);
      toast.success(response.data.message);
    }

    fetchUsers(); // Actualizar la lista de usuarios
    fetchLogs(); // Actualizar logs
    setShowUserModal(false);
    setNewUser({ username: '', password: '' });
    setCurrentUserId(null); // Resetear ID del usuario actual
  } catch (error) {
    toast.error(error.response?.data?.error || 'Error al guardar usuario');
    console.error('Error al guardar el usuario:', error); // Agrega un log detallado del error
  }
};


  // Detect changes
  const handleDetectChanges = async () => {
    const swalLoading = Swal.fire({
      title: 'Verificando Cambios...',
      text: 'Por favor espera...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await axios.get('https://apimongo-3.onrender.com/api/auth/verificar-cambios');
      const { mensaje, alerta, cambios } = response.data;
      swalLoading.close();

      if (alerta) {
        Swal.fire({
          title: '¡Atención!',
          text: alerta,
          icon: 'warning',
          confirmButtonText: 'Aceptar'
        });
        console.log('Cambios detectados:', cambios);
      } else {
        Swal.fire({
          title: 'Éxito',
          text: mensaje,
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      }
    } catch (error) {
      swalLoading.close();
      Swal.fire({
        title: 'Error',
        text: 'Error al verificar cambios 🔍',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    try {
      const response = await axios.delete(`https://apimongo-3.onrender.com/api/auth/users/${id}`);
      toast.success(response.data.message);
      fetchUsers(); // Refresh users after deletion
      fetchLogs();  // Refresh logs after deleting a user
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al eliminar usuario');
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value.toLowerCase());
    setCurrentPage(1);
  };

  // Open edit user modal
  const handleEditUser = (user) => {
    setNewUser({ username: user.username, password: '' });
    setCurrentUserId(user._id);
    setShowUserModal(true); // Open the edit user modal directly
  };

  // Pagination for users
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchQuery)
  );
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Pagination for logs
  const filteredLogs = logs.filter((log) =>
    log.descripcion.toLowerCase().includes(searchQuery)
  );
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPagesLogs = Math.ceil(filteredLogs.length / logsPerPage);

  const paginateLogs = (pageNumber) => setCurrentPage(pageNumber);

  // Render log severity
  const renderLogSeverity = (severity) => {
    switch (severity) {
      case 'severo':
        return <span style={{ color: 'red' }}>Severo</span>;
      case 'importante':
        return <span style={{ color: 'orange' }}>Importante</span>;
      default:
        return <span style={{ color: 'green' }}>Sin Importancia</span>;
    }
  };

  return (
    <div className="monitor-container">
      <ToastContainer position="top-center" autoClose={4000} hideProgressBar={false} closeOnClick pauseOnHover draggable />
      <div className="titulo">
        <h2>Monitoreo de Base de Datos y Gestión de Usuarios</h2>
      </div>

      <button className="btn action-btn" onClick={() => setShowUserModal(true)}>Crear Usuario</button>
      <button className="btn action-btn" onClick={() => setShowUsersListModal(true)}>Ver Usuarios</button>
      <button className="btn action-btn" onClick={handleDetectChanges}>Verificar Cambios</button>
      <button className="btn action-btn" onClick={() => setShowLogsModal(true)}>Ver Logs</button>

      {/* Modal de Crear/Editar Usuario */}
      {showUserModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>{currentUserId ? 'Editar Usuario' : 'Crear Usuario'}</h3>
            <input
              type="text"
              placeholder="Username"
              value={newUser.username}
              onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            />
            {errors.username && <p className="error-message">{errors.username}</p>}
            <input
              type="password"
              placeholder="Password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            {errors.password && <p className="error-message">{errors.password}</p>}
            <button onClick={handleSaveUser}>{currentUserId ? 'Actualizar Usuario' : 'Crear Usuario'}</button>
            <button onClick={() => setShowUserModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal de Lista de Usuarios */}
      {showUsersListModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Lista de Usuarios</h3>
            <input
              type="text"
              placeholder="Buscar usuario"
              value={searchQuery}
              onChange={handleSearch}
            />
            <ul>
              {currentUsers.map((user) => (
                <li key={user._id}>
                  {user.username}
                  <button onClick={() => handleEditUser(user)}>Editar</button>
                  <button onClick={() => handleDeleteUser(user._id)}>Eliminar</button>
                </li>
              ))}
            </ul>
            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginateLogs(page)}
                  className={page === currentPage ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
            </div>
            <button onClick={() => setShowUsersListModal(false)}>Cerrar</button>
          </div>
        </div>
      )}

      {/* Modal de Logs */}
      {showLogsModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Logs de Auditoría</h3>
            <input
              type="text"
              placeholder="Buscar log"
              value={searchQuery}
              onChange={handleSearch}
            />
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Severidad</th>
                  <th>Datos</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <tr key={index}>
                    <td>{new Date(log.fecha).toLocaleString()}</td>
                    <td>{log.descripcion}</td>
                    <td>{renderLogSeverity(log.severidad)}</td>
                    <td>{log.datos_afectados.map((d) => d.usuario).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination">
              {Array.from({ length: totalPagesLogs }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginateLogs(page)}
                  className={page === currentPage ? 'active' : ''}
                >
                  {page}
                </button>
              ))}
            </div>
            <button onClick={() => setShowLogsModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Monitor;
