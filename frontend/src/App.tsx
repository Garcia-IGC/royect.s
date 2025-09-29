import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useState } from 'react';
import LoginPage from './LoginPage';
import Malla from './MeshPage/malla';
import './styles.css';


const App: React.FC = () => {
    const [userData, setUserData] = useState<{ rut: string; carreras: any[] } | null>(null);

    const handleLogin = (datosUsuario: { rut: string; carreras: any[] }) => {
        setUserData(datosUsuario);
        console.log('Datos del usuario:', datosUsuario);
    };

    return (
        <Router>
            <div className='contenedorBody'>
                <Routes>
                    {/* Página de inicio con el login */}
                    <Route path="/" element={
                        <>
                        <h1 className='tituloInicio'>Inicio de Sesión</h1>
                        <LoginPage onLogin={handleLogin} />
                        </>
                        
                    } />

                    {/* Página de malla */}
                    <Route path="/malla" element={<Malla userData={userData}/>} />

                    
                </Routes>
            </div>
        </Router>
        
    );
};

export default App;