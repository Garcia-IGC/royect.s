import React from 'react';
import { useMalla } from './hooks/useMalla';
import { useNavigation } from './hooks/useNavigation';
import Sidebar from './components/Sidebar';
import SidebarOverlay from './components/SidebarOverlay';
import Header from './components/Header';
import ViewRenderer from './components/ViewRenderer';
import LoadingScreen from './components/LoadingScreen';

interface MallaProps {
  userData: { rut: string; carreras: any[] } | null;
}

const Malla: React.FC<MallaProps> = ({ userData }) => {
  const { data, loading, error } = useMalla({ userData });
  const {
    view,
    sidebarOpen,
    proyeccionEditando,
    setSidebarOpen,
    handleNavigate,
    handleEditarProyeccion,
    handleCancelarEdicion,
  } = useNavigation();

  if (loading) return <LoadingScreen />;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No hay datos</p>;

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
