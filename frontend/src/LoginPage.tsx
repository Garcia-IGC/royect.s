import React, { useState } from 'react';
import './styles.css'
import axios from 'axios';

type LoginPageProps = {
  onLogin: (data: any) => void;
};

/// Pagina de login que tambien revisa los parametros de autenticacion enviados por el back

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        username,
        password,
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        console.log('Login successful:', response.data);
        // Guardar en localStorage
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userData', JSON.stringify(response.data));
        // Pasar datos completos al callback
        onLogin(response.data);
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Asegúrate de que el backend está corriendo.');
    }
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-indigo-100 p-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 text-center">Iniciar sesión</h1>
        <p className="text-xs text-gray-500 text-center mt-1">Accede para ver tu avance curricular</p>

        <div className="mt-5">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Usuario</label>
          <input
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        {error && <div className="mt-3 text-sm text-red-600 ">{error}</div>}

        <button
          className="mt-5 w-full rounded-lg bg-indigo-600 text-white text-sm font-semibold py-2.5 shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          type="submit"
        >
          Entrar
        </button>
      </form>
    </div>
  );


};

export default LoginPage;