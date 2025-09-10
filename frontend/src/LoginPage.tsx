import React, { useState } from 'react';
import './styles.css'
import axios from 'axios';

type LoginPageProps = {
  onLogin: (username: string, password: string) => void;
};

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
        onLogin(username, password);
        
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Asegúrate de que el backend está corriendo.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='contenedor'> 
      <label htmlFor="username">Usuario:  </label>
      <input id="username" value={username} onChange={e => setUsername(e.target.value)} />
      </div>
      
      <div className='contenedor'> 
      <label htmlFor="password">Contraseña:  </label>
      <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      
      {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}

      <div className='contenedor'> 
      <br/>
      <button className= 'botonEntrar'type="submit">Entrar</button>
      </div>
    </form>
  );
};

export default LoginPage;