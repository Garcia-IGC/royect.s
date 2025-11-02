import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import Malla from './MeshPage/malla';
import './styles.css';

const App: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Verificar si hay sesión guardada al cargar la aplicación
    useEffect(() => {
        const savedIsLoggedIn = localStorage.getItem('isLoggedIn');
        const savedUserData = localStorage.getItem('userData');
        
        if (savedIsLoggedIn === 'true' && savedUserData) {
            setIsLoggedIn(true);
            setUserData(JSON.parse(savedUserData));
        }
        setLoading(false);
    }, []);

    const handleLogin = (data: any) => {
        setIsLoggedIn(true);
        setUserData(data);
    };

    const handleLogout = () => {
        localStorage.removeItem('userData');
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        setUserData(null);
    };

    // Mostrar loading mientras verifica la sesión
    if (loading) {
        return <div className = "text-center">Cargando...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        isLoggedIn ? (
                            <Navigate to="/malla" replace />
                        ) : (
                                <LoginPage onLogin={handleLogin} />
                        )
                    } 
                />
                <Route 
                    path="/malla" 
                    element={
                        isLoggedIn ? (
                            <div>
                                <button 
                                    onClick={handleLogout}
                                    style={{
                                        position: 'absolute',
                                        top: '20px',
                                        right: '20px',
                                        padding: '10px 20px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cerrar Sesión
                                </button>
                                <Malla userData={userData} />
                            </div>
                        ) : (
                            <Navigate to="/" replace />
                        )
                    } 
                />
            </Routes>
        </Router>
    );
};

export default App;