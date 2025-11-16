import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SimuladorAvance from './SimuladorAvance'; 
import MostradorAvances from './MostradorAvances'; 
import Cursados from './Cursados';
import Proyeccion from './Proyeccion';
import AvanceView from './Avance';
import { AuthDataDto } from './types';

interface MallaProps {
  userData: { rut: string; carreras: any[] } | null;
}

const Malla: React.FC<MallaProps> = ({ userData }) => {
  const [data, setData] = useState<AuthDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredAsignatura, setHoveredAsignatura] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<'avance' | 'cursados' | 'proyeccion'| 'simulador' | 'guardadas'>('avance');
  

  useEffect(() => {
    if (!userData) {
      setLoading(false);
      return;
    }

    // Validar que userData.carreras exista y sea un array
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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur rounded-xl shadow px-4 py-3 text-sm text-gray-700">
          Cargando mallas…
        </div>
      </div>;
  if (error) return <p>{error}</p>;
  if (!data) return <p>No hay datos</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl border-r transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Mi panel</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>

        <nav className="p-3 space-y-2">
          <button
            onClick={() => {
              setView('avance');
              setSidebarOpen(false);
            }}
            className={`w-full text-left text-sm px-3 py-2 rounded border ${
              view === 'avance'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            Avance curricular
          </button>

          <button
            onClick={() => {
              setView('cursados');
              setSidebarOpen(false);
            }}
            className={`w-full text-left text-sm px-3 py-2 rounded border ${
              view === 'cursados'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            Cursos cursados
          </button>

          <button
            onClick={() => {
              setView('proyeccion');
              setSidebarOpen(false);
            }}
            className={`w-full text-left text-sm px-3 py-2 rounded border ${
              view === 'proyeccion'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            Proyección
          </button>

          <button
            onClick={() => {
              setView('simulador');   
              setSidebarOpen(false);
            }}
            className={`w-full text-left text-sm px-3 py-2 rounded border ${
              view === 'simulador'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            Simulador de avance
          </button>

          <button
            onClick={() => {
              setView('guardadas');   
              setSidebarOpen(false);
            }}
            className={`w-full text-left text-sm px-3 py-2 rounded border ${
              view === 'guardadas'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
            }`}
          >
            📚 Proyecciones Guardadas
          </button>
        </nav>
      </div>

      {/* Fondo oscuro cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="max-w-[98%] mx-auto">
        {/* Botón para abrir el panel */}
        <div className="mb-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-sm px-3 py-2 rounded-md bg-white/80 hover:bg-white shadow border border-gray-200"
          >
            ☰
          </button>
        </div>

        {/* Título Principal */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Mallas Curriculares</h1>
          <p className="text-sm text-gray-600">RUT: {data.rut}</p>
        </div>

        {/* --- Vista: Avance --- */}
        {view === 'avance' && (
        <AvanceView carreras={data.carreras} />
      )}

        {/* --- Vista: Cursos cursados --- */}
        {view === 'cursados' && (
          <Cursados carreras={data.carreras} />
        )}

        {/* --- Vista: Proyección --- */}
        {view === 'proyeccion' && (
          <Proyeccion carreras={data.carreras} />
        )}

        {/* --- Vista: Simulador --- */}
        {view === 'simulador' && (
          <SimuladorAvance data={data} />   // <-- NUEVO
        )}

        {/* --- Vista: Proyecciones Guardadas --- */}
        {view === 'guardadas' && data && (
          <MostradorAvances rut={data.rut} />
        )}

      </div>
    </div>
  );
};

export default Malla;
