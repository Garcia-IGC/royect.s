import React, { useEffect, useState } from 'react';
import axios from 'axios';

export interface AuthDataDto {
  rut: string;
  carreras: CarreraDto[];
}

export interface CarreraDto {
  codigo: string;
  carrera: string;
  catalogo: string;
  malla: Asignatura[];
}

export interface Asignatura {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  status: string;
  intento: number;
}

interface MallaProps {
  userData: { rut: string; carreras: any[] } | null;
}

const Malla: React.FC<MallaProps> = ({ userData }) => {
  const [data, setData] = useState<AuthDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredAsignatura, setHoveredAsignatura] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<'avance' | 'cursados' | 'proyeccion'>('avance');

  useEffect(() => {
    if (!userData) {
      setLoading(false);
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

  // Función para obtener nombres de prerequisitos
  const obtenerNombresPrereq = (codigosPrereq: string, malla: Asignatura[]): string => {
    if (!codigosPrereq) return '';
    const codigos = codigosPrereq.split(',').map((c) => c.trim());
    const nombres = codigos.map((codigo) => {
      const asignatura = malla.find((a) => a.codigo === codigo);
      return asignatura ? asignatura.asignatura : codigo;
    });
    return nombres.join(', ');
  };

  function agruparPorSemestre(malla: Asignatura[]) {
    const semestres: Record<number, Asignatura[]> = {};
    malla.forEach((asig) => {
      if (!semestres[asig.nivel]) semestres[asig.nivel] = [];
      semestres[asig.nivel].push(asig);
    });

    return Object.keys(semestres)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({
        nivel,
        asignaturas: semestres[nivel],
      }));
  }

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
          <>
            {data.carreras.map((carrera, idx) => {
              const semestresAgrupados = agruparPorSemestre(carrera.malla);
              return (
                <div key={idx} className="mb-8">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl p-3 shadow-lg">
                    <h2 className="text-xl font-bold text-white">{carrera.carrera}</h2>
                    <p className="text-indigo-100 text-xs mt-0.5">
                      Código: {carrera.codigo} | Catálogo: {carrera.catalogo}
                    </p>
                  </div>

                  {/* Grid de semestres */}
                  <div className="bg-white rounded-b-xl shadow-lg p-3 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                      {semestresAgrupados.map(({ nivel, asignaturas }) => (
                        <div key={nivel} className="flex-shrink-0 w-48">
                          <div className="bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg p-2 mb-2">
                            <h3 className="text-sm font-semibold text-white text-center">
                              Semestre {nivel}
                            </h3>
                          </div>

                          {/* Lista de asignaturas */}
                          <div className="space-y-2">
                            {asignaturas.map((asig, i) => {
                              const asignaturaId = `${idx}-${nivel}-${i}`;
                              const nombresPrereq = obtenerNombresPrereq(
                                asig.prereq,
                                carrera.malla
                              );

                              return (
                                <div
                                  key={i}
                                  className="relative bg-gradient-to-br from-teal-50 to-cyan-50 border-l-4 border-teal-400 rounded-lg p-2.5 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-102 cursor-pointer"
                                  onMouseEnter={() => setHoveredAsignatura(asignaturaId)}
                                  onMouseLeave={() => setHoveredAsignatura(null)}
                                >
                                  <div className="flex items-start justify-between mb-1.5">
                                    <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                                      {asig.codigo}
                                    </span>
                                    <span className="text-[10px] font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                                      {asig.creditos} SCT
                                    </span>
                                    <span
                                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                        asig.status === 'APROBADO' || asig.status === 'INSCRITO'
                                          ? 'bg-green-100 text-green-700 border border-green-300'
                                          : 'bg-red-100 text-red-700 border border-red-300'
                                      }`}
                                    >
                                      {asig.status}
                                    </span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                      {asig.intento}
                                    </span>
                                  </div>

                                  <h4 className="text-xs font-semibold text-gray-800 mb-1 leading-tight">
                                    {asig.asignatura}
                                  </h4>

                                  {/* Tooltip de prerequisitos */}
                                  {asig.prereq && hoveredAsignatura === asignaturaId && (
                                    <div className="absolute left-full ml-2 top-0 z-50 w-64 bg-white border-2 border-teal-400 rounded-lg shadow-2xl p-3">
                                      <div className="text-xs font-bold text-teal-700 mb-2 border-b border-teal-200 pb-1">
                                        📋 Prerequisitos:
                                      </div>
                                      <div className="text-[11px] text-gray-700 leading-relaxed">
                                        {nombresPrereq}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* --- Vista: Cursos cursados --- */}
        {view === 'cursados' && (
          <>
            {data.carreras.map((carrera, idx) => {
              const cursados = carrera.malla.filter(
                (a) => a.status === 'APROBADO' || a.status === 'REPROBADO'
              );
              return (
                <div key={idx} className="mb-8">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl p-3 shadow-lg">
                    <h2 className="text-xl font-bold text-white">{carrera.carrera}</h2>
                    <p className="text-indigo-100 text-xs mt-0.5">
                      Código: {carrera.codigo} | Catálogo: {carrera.catalogo}
                    </p>
                  </div>

                  <div className="bg-white rounded-b-xl shadow-lg p-3">
                    {cursados.length === 0 ? (
                      <p className="text-sm text-gray-600">No hay cursos cursados aún.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {cursados.map((asig, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-emerald-400 rounded-lg p-2.5 shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                {asig.codigo}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                                {asig.creditos} SCT
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                                CURSADO
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-gray-800 leading-tight">
                              {asig.asignatura}
                            </h4>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* --- Vista: Proyección --- */}
        {view === 'proyeccion' && (
          <>
            {data.carreras.map((carrera, idx) => {
              const pendientes = carrera.malla.filter(
                (a) => a.status !== 'APROBADO' && a.status !== 'INSCRITO'
              );
              return (
                <div key={idx} className="mb-8">
                  <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl p-3 shadow-lg">
                    <h2 className="text-xl font-bold text-white">{carrera.carrera}</h2>
                    <p className="text-indigo-100 text-xs mt-0.5">
                      Código: {carrera.codigo} | Catálogo: {carrera.catalogo}
                    </p>
                  </div>

                  <div className="bg-white rounded-b-xl shadow-lg p-3">
                    {pendientes.length === 0 ? (
                      <p className="text-sm text-gray-600">No quedan cursos por cursar.</p>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {pendientes.map((asig, i) => (
                          <div
                            key={i}
                            className="bg-gradient-to-br from-rose-50 to-red-50 border-l-4 border-rose-400 rounded-lg p-2.5 shadow-sm"
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                                {asig.codigo}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                                {asig.creditos} SCT
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                                NO CURSADO
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-gray-800 leading-tight">
                              {asig.asignatura}
                            </h4>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default Malla;
