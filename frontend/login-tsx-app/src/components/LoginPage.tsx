import React, { useState } from 'react';
import './styles.css'

type LoginPageProps = {
  onLogin: (username: string, password: string) => void;
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(username, password);
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
      
      <div className='contenedor'> 
      <br/>
      <button className= 'botonEntrar'type="submit">Entrar</button>
      </div>
    </form>
  );
};

export default LoginPage;