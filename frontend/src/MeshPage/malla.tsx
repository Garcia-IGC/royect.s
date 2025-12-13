import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AuthDataDto } from './types';
import { ViewType } from './constants/navigation';
import Sidebar from './components/Sidebar';
import SidebarOverlay from './components/SidebarOverlay';
import Header from './components/Header';
import ViewRenderer from './components/ViewRenderer';
import LoadingScreen from './components/LoadingScreen';

interface MallaProps {
  userData: { rut: string; carreras: any[] } | null;
}

const Malla: React.FC<MallaProps> = ({ userData }) => {
  const [data, setData] = useState<AuthDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<ViewType>('avance');
  const [proyeccionEditando, setProyeccionEditando] = useState<any>(null);

  useEffect(() => {
    if (!userData) {
      setLoading(false);
      return;
    }

    if (!userData.carreras || !Array.isArray(userData.carreras)) {
      setLoading(false);
      setError('No se encontraron carreras para este usuario');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      rut: userData.rut,
      carreras: userData.carreras.map((c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
        catalogo: c.catalogo,
      })),
    };

    const fetchMallas = async () => {
      try {
        const response = await axios.post<AuthDataDto>(
          'http://localhost:3000/malla/malla-avance',
          payload
        );
        setData(response.data);
      } catch (err) {
        setError('Error al obtener las mallas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMallas();
  }, [userData]);

  if (loading) return <LoadingScreen />;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No hay datos</p>;

  const handleNavigate = (newView: ViewType) => {
    setView(newView);
    setSidebarOpen(false);
  };

  const handleEditarProyeccion = (proyeccion: any) => {
    setProyeccionEditando(proyeccion);
    setView('simulador');
  };

  const handleCancelarEdicion = () => {
    setProyeccionEditando(null);
    setView('guardadas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Sidebar
        isOpen={sidebarOpen}
        currentView={view}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
      />

      <SidebarOverlay
        isVisible={sidebarOpen}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="max-w-[98%] mx-auto">
        <Header rut={data.rut} onMenuClick={() => setSidebarOpen(true)} />

        <ViewRenderer
          currentView={view}
          data={data}
          proyeccionEditando={proyeccionEditando}
          onEditarProyeccion={handleEditarProyeccion}
          onCancelarEdicion={handleCancelarEdicion}
        />
      </div>
    </div>
  );
};

export default Malla;
