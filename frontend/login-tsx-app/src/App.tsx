import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import './components/styles.css';

const App: React.FC = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });

    const handleLogin = (username: string, password: string) => {
        setCredentials({ username, password });
        // Aquí puedes agregar la lógica para manejar el inicio de sesión
        console.log('Credenciales:', credentials);
    };

    return (
        <div className='contenedorBody'>
            <h1 className='tituloInicio'>Inicio de Sesión</h1>
            <LoginPage onLogin={handleLogin} />
        </div>
    );
};

export default App;