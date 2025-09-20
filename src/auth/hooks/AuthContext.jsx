import React, { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Asegúrate de que jwt-decode esté correctamente importado
import { useNavigate } from 'react-router-dom';

const userContext = createContext();

export const  AuthContext = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const token = localStorage.getItem('token'); 
  const navigate = useNavigate();

  const addUser = (datos) => {
    setUser(datos);
    localStorage.setItem('user', JSON.stringify(datos));
    localStorage.setItem('token', datos.token);
  };

  const cerrarSesion = () => {
    setUser(token); // Establece el usuario como null al cerrar sesión
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const isTokenExpired = (token) => {
    try {
      if (!token) return true;

      const { exp } = jwtDecode(token);
      if (!exp) return true;
      return Date.now() >= exp * 3600; // Cambiar *3600 a *1000 porque `exp` está en segundos
    } catch (error) {
      console.error("Token inválido:", error);
      return true; // Si hay un error en el decodificado, consideramos que el token ha caducado
    }
  };
  
  /*useEffect(() => {
    if (isTokenExpired(token)) {
      let timerInterval;
      Swal.fire({
        title: "Su sesión ha expirado",
        html: "Cerrando sesión.",
        timer: 2000,
        timerProgressBar: true,
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getHtmlContainer().querySelector('b');
          timerInterval = setInterval(() => {
          }, 100);
        },
        willClose: () => {
          clearInterval(timerInterval);
          cerrarSesion(true); // Cerrar sesión después de la alerta
        }
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          console.log("Alerta cerrada por el temporizador");
        }
      });
    }
  }, [token]);*/

  const verificarToken = () => {
    if (isTokenExpired(token)) {
      cerrarSesion(true); // Pasar true para indicar que la sesión ha expirado
      throw new Error('Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.');
    }
  };
  

  console.log(user);

  const value = {
    user,
    setUser,
    addUser,
    cerrarSesion,
    verificarToken // Añadimos la función de verificación
  };

  return (
    <userContext.Provider value={value}>
      {children}
    </userContext.Provider>
  );
}
export default userContext;