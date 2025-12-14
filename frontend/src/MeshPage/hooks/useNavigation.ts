import { useState } from 'react';
import { ViewType } from '../constants/navigation';

export const useNavigation = () => {
  const [view, setView] = useState<ViewType>('avance');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [proyeccionEditando, setProyeccionEditando] = useState<any>(null);

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

  return {
    view,
    sidebarOpen,
    proyeccionEditando,
    setView,
    setSidebarOpen,
    setProyeccionEditando,
    handleNavigate,
    handleEditarProyeccion,
    handleCancelarEdicion,
  };
};
