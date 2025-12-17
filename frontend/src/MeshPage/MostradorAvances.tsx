import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { proyeccionService } from './services/proyeccionService';

interface Ramo {
  id_ramo: number;
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  intento: number;
  status: string;
  cursada: boolean;
}

interface Semestre {
  id_semestre: number;
  semestre: number;
  ramos: Ramo[];
}

interface Proyeccion {
  id_proyeccion: number;
  codigo: string;
  nombre: string;
  semestres: Semestre[];
}

interface MostradorAvancesProps {
  rut: string;
  onEditarProyeccion?: (proyeccion: Proyeccion) => void;
}

const MostradorAvances: React.FC<MostradorAvancesProps> = ({ rut, onEditarProyeccion }) => {
  const [proyecciones, setProyecciones] = useState<Proyeccion[]>([]);
  const [proyeccionSeleccionada, setProyeccionSeleccionada] = useState<Proyeccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredAsignatura, setHoveredAsignatura] = useState<string | null>(null);
  const [demandaMap, setDemandaMap] = useState<Record<string, number>>({});

  useEffect(() => {
    cargarProyecciones();
  }, [rut]);

  useEffect(() => {
    //demanda global
    const cargarDemanda = async () => {
      try {
        const data = await proyeccionService.demanda();
        const map = data.reduce<Record<string, number>>((acc, item) => {
          acc[item.codigo] = item.demanda;
          return acc;
        }, {});
        setDemandaMap(map);
      } catch (e) {
        
        console.warn('No se pudo cargar demanda por asignatura');
      }
    };
    cargarDemanda();
  }, []);

  const cargarProyecciones = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/proyeccion/obtener/${rut}`);
      setProyecciones(response.data);
      
      
      if (response.data.length > 0) {
        setProyeccionSeleccionada(response.data[0]);
      }
    } catch (err) {
      console.error('Error al cargar proyecciones:', err);
      setError('Error al cargar las proyecciones guardadas');
    } finally {
      setLoading(false);
    }
  };

  const eliminarProyeccion = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta proyección?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:3000/proyeccion/eliminar/${id}`);
      await cargarProyecciones();
      setProyeccionSeleccionada(null);
    } catch (err) {
      console.error('Error al eliminar proyección:', err);
      alert('Error al eliminar la proyección');
    }
  };

  const obtenerNombresPrereq = (codigosPrereq: string, ramos: Ramo[]): string => {
    if (!codigosPrereq) return '';
    const codigos = codigosPrereq.split(',').map((c) => c.trim());
    const nombres = codigos.map((codigo) => {
      const ramo = ramos.find((r) => r.codigo === codigo);
      return ramo ? ramo.asignatura : codigo;
    });
    return nombres.join(', ');
  };

  const calcularEstadisticas = (proyeccion: Proyeccion) => {
    const todosLosRamos = proyeccion.semestres.flatMap(s => s.ramos);
    const aprobados = todosLosRamos.filter(r => r.status === 'APROBADO').length;
    const reprobados = todosLosRamos.filter(r => r.status === 'REPROBADO').length;
    const inscritos = todosLosRamos.filter(r => r.status === 'INSCRITO').length;
    const noCursados = todosLosRamos.filter(r => r.status === 'NO CURSADO').length;
    const total = todosLosRamos.length;
    const porcentaje = total > 0 ? Math.round((aprobados / total) * 100) : 0;

    return { aprobados, reprobados, inscritos, noCursados, total, porcentaje };
  };

  
  type DemandaItem = { codigo: string; asignatura: string };

  const cursosDemanda = useMemo<DemandaItem[]>(() => {
    if (!proyeccionSeleccionada) return [];
    const ramos = proyeccionSeleccionada.semestres.flatMap(s => s.ramos);
    const map = new Map<string, DemandaItem>();
    ramos.forEach(r => {
      if (!map.has(r.codigo)) {
        map.set(r.codigo, { codigo: r.codigo, asignatura: r.asignatura });
      }
    });
    return Array.from(map.values());
  }, [proyeccionSeleccionada]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="bg-white/90 backdrop-blur rounded-xl shadow px-4 py-3 text-sm text-gray-700">
          Cargando proyecciones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (proyecciones.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-gray-700 mb-2">No hay proyecciones guardadas</p>
        <p className="text-sm text-gray-600">
          Usa el simulador de avance para crear y guardar proyecciones
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lista de proyecciones guardadas */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          📚 Proyecciones Guardadas ({proyecciones.length})
        </h3>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {proyecciones.map((proyeccion) => {
            const stats = calcularEstadisticas(proyeccion);
            const isSelected = proyeccionSeleccionada?.id_proyeccion === proyeccion.id_proyeccion;
            
            return (
              <div
                key={proyeccion.id_proyeccion}
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 bg-white'
                }`}
                onClick={() => setProyeccionSeleccionada(proyeccion)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {proyeccion.nombre}
                    </h4>
                    <p className="text-xs text-gray-600">Código: {proyeccion.codigo}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditarProyeccion && onEditarProyeccion(proyeccion);
                      }}
                      className="text-blue-500 hover:text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-50"
                      title="Editar proyección"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        eliminarProyeccion(proyeccion.id_proyeccion);
                      }}
                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                      title="Eliminar proyección"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Progreso:</span>
                    <span className="font-semibold text-indigo-600">{stats.porcentaje}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${stats.porcentaje}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>✅ {stats.aprobados}</span>
                    <span>❌ {stats.reprobados}</span>
                    <span>📝 {stats.inscritos}</span>
                    <span>⏳ {stats.noCursados}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detalles de la proyección seleccionada */}
      {proyeccionSeleccionada && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-4">
            <h3 className="text-xl font-bold text-white">
              {proyeccionSeleccionada.nombre}
            </h3>
            <p className="text-indigo-100 text-sm">
              Código: {proyeccionSeleccionada.codigo}
            </p>
          </div>

          <div className="p-4">
            {/* Grid de semestres */}
            <div className="overflow-x-auto overflow-y-visible relative isolate">
              <div className="flex gap-3 min-w-max pb-4">
                {proyeccionSeleccionada.semestres.map((semestre) => {
                  const todosLosRamos = proyeccionSeleccionada.semestres.flatMap(s => s.ramos);
                  
                  return (
                    <div key={semestre.id_semestre} className="flex-shrink-0 w-52">
                      <div className="bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg p-2 mb-3">
                        <h4 className="text-sm font-semibold text-white text-center">
                          Semestre {semestre.semestre}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {semestre.ramos
                          .filter((ramo) => ramo.status === 'PROYECTADO')
                          .map((ramo, idx) => {
                          const ramoId = `${semestre.id_semestre}-${idx}`;
                          const nombresPrereq = obtenerNombresPrereq(ramo.prereq, todosLosRamos);
                          
                          // Determinar si el ramo fue movido de su semestre original o está proyectado
                          const fueMovido = ramo.nivel !== semestre.semestre;
                          const esProyectado = ramo.status === 'PROYECTADO';
                          
                          // Determinar colores según estado y si fue movido
                          let bgColor, borderColor, codigoBadge;
                          
                          if (ramo.status === 'APROBADO') {
                            bgColor = 'bg-gradient-to-br from-green-50 to-emerald-50';
                            borderColor = 'border-emerald-500';
                            codigoBadge = 'bg-emerald-100 text-emerald-700';
                          } else if (ramo.status === 'INSCRITO') {
                            bgColor = 'bg-gradient-to-br from-blue-50 to-sky-50';
                            borderColor = 'border-sky-500';
                            codigoBadge = 'bg-sky-100 text-sky-700';
                          } else if (fueMovido || esProyectado) {
                            // Ramo proyectado/movido - color morado
                            bgColor = 'bg-gradient-to-br from-purple-50 to-violet-50';
                            borderColor = 'border-purple-500';
                            codigoBadge = 'bg-purple-100 text-purple-700';
                          } else {
                            bgColor = 'bg-gradient-to-br from-teal-50 to-cyan-50';
                            borderColor = 'border-teal-400';
                            codigoBadge = 'bg-teal-100 text-teal-700';
                          }

                          return (
                            <div
                              key={ramo.id_ramo}
                              className={`relative z-10 ${bgColor} border-l-4 ${borderColor} rounded-lg p-3 shadow-md hover:shadow-lg hover:z-20 transition-all duration-200 hover:scale-105 cursor-pointer`}
                              onMouseEnter={() => setHoveredAsignatura(ramoId)}
                              onMouseLeave={() => setHoveredAsignatura(null)}
                            >
                              <div className="flex items-start justify-between mb-2 gap-1 flex-wrap">
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${codigoBadge}`}>
                                  {ramo.codigo}
                                </span>
                                <span className="text-[10px] font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                                  {ramo.creditos} SCT
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                    ramo.status === 'APROBADO' || ramo.status === 'INSCRITO'
                                      ? 'bg-green-100 text-green-700 border border-green-300'
                                      : ramo.status === 'REPROBADO'
                                      ? 'bg-red-100 text-red-700 border border-red-300'
                                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                                  }`}
                                >
                                  {ramo.status}
                                </span>
                                {ramo.intento > 0 && (
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                                    Intento: {ramo.intento}
                                  </span>
                                )}
                              </div>

                              <h5 className="text-xs font-semibold text-gray-800 mb-1 leading-tight">
                                {ramo.asignatura}
                              </h5>

                              {/* Badge de ramo proyectado */}
                              {(fueMovido || esProyectado) && (
                                <div className="mt-2">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500 text-white">
                                    {fueMovido 
                                      ? `📍 Proyectado (S${ramo.nivel}→S${semestre.semestre})` 
                                      : '📍 Proyectado'}
                                  </span>
                                </div>
                              )}

                              {/* Tooltip de prerequisitos */}
                              {ramo.prereq && hoveredAsignatura === ramoId && (
                                <div className="absolute left-full ml-2 top-0 z-[999] w-64 bg-white border-2 border-teal-400 rounded-lg shadow-2xl p-3">
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
                  );
                })}
              </div>
            </div>

            {/* Leyenda de colores */}
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4">
              <p className="text-sm font-bold text-indigo-800 mb-3">💡 Leyenda de colores:</p>
              <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>
                    Borde <strong className="text-green-600">verde</strong>: Ramo aprobado
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sky-600">✓</span>
                  <span>
                    Borde <strong className="text-sky-600">azul</strong>: Ramo inscrito
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-purple-600">📍</span>
                  <span>
                    Borde <strong className="text-purple-600">morado</strong>: Ramo proyectado/movido de su semestre original
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-teal-600">✓</span>
                  <span>
                    Borde <strong className="text-teal-600">teal</strong>: Ramo en su semestre original
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {proyeccionSeleccionada && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-800">Demanda (próximo semestre)</h3>
            <span className="text-xs text-gray-500">(dato pendiente)</span>
          </div>

          {cursosDemanda.length === 0 ? (
            <p className="text-sm text-gray-600">No hay ramos para estimar demanda.</p>
          ) : (
            <div className="divide-y">
              {cursosDemanda.map((item) => (
                <div key={item.codigo} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{item.asignatura}</div>
                    <div className="text-xs text-gray-500">{item.codigo}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-indigo-700">
                      {demandaMap[item.codigo] ?? '--'}
                    </span>
                    <span className="text-xs text-gray-500">proyecciones</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MostradorAvances;
