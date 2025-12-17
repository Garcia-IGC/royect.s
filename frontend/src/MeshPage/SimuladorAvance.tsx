import React, { useEffect } from 'react';
import { AuthDataDto } from './types';
import { useSimulador } from './hooks/useSimulador';
import { proyeccionService } from './services/proyeccionService';
import CarrerHeader from './components/CarrerHeader';
import SemesterCard from './components/SemesterCard';
import AsignatureCard from './components/AsignatureCard';
import PrerequisiteTooltip from './components/PrerequisiteTooltip';
import UsageGuide from './components/UsageGuide';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  status: string;
  intento: number;
};

type ProyeccionEditar = {
  id_proyeccion: number;
  codigo: string;
  nombre: string;
  semestres: Array<{
    semestre: number;
    ramos: Array<{
      codigo: string;
      nivel: number;
      status: string;
    }>;
  }>;
};

type Props = {
  data: AuthDataDto;
  proyeccionEditar?: ProyeccionEditar;
  onCancelarEdicion?: () => void;
};

const SimuladorAvance: React.FC<Props> = ({ data, proyeccionEditar, onCancelarEdicion }) => {
  const simulador = useSimulador(data);

  useEffect(() => {
    if (proyeccionEditar) {
      simulador.cargarProyeccionParaEditar(proyeccionEditar);
    }
  }, [proyeccionEditar]);

  const simularInscripcion = (codCarrera: string) => {
    const plan = simulador.planPorCarrera[codCarrera] ?? {};
    const carrera = data.carreras.find((c) => c.codigo === codCarrera);
    if (!carrera) return;

    const inscritosSimulados = simulador.ramosInscritosSimulacion[codCarrera] ?? new Set();
    let mensaje = '📚 SIMULACIÓN DE INSCRIPCIÓN\n\n';

    if (inscritosSimulados.size > 0) {
      mensaje += '🟣 RAMOS MARCADOS COMO INSCRITOS (SIMULACIÓN):\n';
      Array.from(inscritosSimulados).forEach((codigo) => {
        const asig = carrera.malla.find((a) => a.codigo === codigo);
        if (asig) mensaje += `  ✓ ${asig.asignatura} (${asig.codigo}) - Nivel ${asig.nivel}\n`;
      });
      mensaje += '\n';
    }
    
    const semestresOrdenados = Object.keys(plan).map(Number).sort((a, b) => a - b);

    if (semestresOrdenados.length === 0 && inscritosSimulados.size === 0) {
      alert('⚠️ No hay cambios para simular. Mueve algunos ramos o marca ramos como inscritos primero.');
      return;
    }

    if (semestresOrdenados.length > 0) {
      mensaje += '📋 RAMOS REORGANIZADOS:\n\n';
      semestresOrdenados.forEach((nivel) => {
        const codigos = plan[nivel] ?? [];
        if (codigos.length > 0) {
          mensaje += `📅 SEMESTRE ${nivel}:\n`;
          codigos.forEach((codigo) => {
            const asig = carrera.malla.find((a) => a.codigo === codigo);
            if (asig) {
              const cumple = simulador.cumplePrereq(asig, plan, nivel, carrera.malla, carrera.codigo);
              mensaje += `  ${cumple ? '✅' : '❌'} ${asig.asignatura} (${asig.codigo}) - ${asig.creditos} SCT\n`;
            }
          });
          mensaje += '\n';
        }
      });
    }

    const totalAsignaturas = semestresOrdenados.reduce((acc, nivel) => acc + (plan[nivel]?.length ?? 0), 0);
    const creditosTotales = semestresOrdenados.reduce((acc, nivel) => {
      const codigos = plan[nivel] ?? [];
      return acc + codigos.reduce((sum, codigo) => {
        const asig = carrera.malla.find((a) => a.codigo === codigo);
        return sum + (asig?.creditos ?? 0);
      }, 0);
    }, 0);

    if (semestresOrdenados.length > 0) {
      mensaje += `📊 TOTAL REORGANIZADOS: ${totalAsignaturas} asignaturas planificadas\n`;
      mensaje += `📊 CRÉDITOS TOTALES: ${creditosTotales} SCT\n`;
    }
    
    mensaje += `\n💡 Ramos marcados como inscritos: ${inscritosSimulados.size}`;
    mensaje += '\n💡 Esta es solo una simulación. Usa "Guardar Proyección" para almacenar los cambios.';

    alert(mensaje);
  };

  const guardar = async (codCarrera: string) => {
    const plan = simulador.planPorCarrera[codCarrera] ?? {};
    const carrera = data.carreras.find((c) => c.codigo === codCarrera);
    if (!carrera) return;

    const inscritosSimulados = simulador.ramosInscritosSimulacion[codCarrera] ?? new Set();
    const planCompleto: Record<number, any[]> = {};

    carrera.malla.forEach((asig) => {
      if (!planCompleto[asig.nivel]) planCompleto[asig.nivel] = [];
      planCompleto[asig.nivel].push(asig);
    });

    Object.entries(plan).forEach(([nivelStr, codigos]) => {
      const nivel = Number(nivelStr);
      codigos.forEach((codigo) => {
        const asig = carrera.malla.find((a) => a.codigo === codigo);
        if (asig) {
          Object.keys(planCompleto).forEach((n) => {
            planCompleto[Number(n)] = planCompleto[Number(n)].filter((a) => a.codigo !== codigo);
          });
          if (!planCompleto[nivel]) planCompleto[nivel] = [];
          planCompleto[nivel].push({ ...asig });
        }
      });
    });

    try {
      await simulador.guardarProyeccion(codCarrera, planCompleto, inscritosSimulados);
      
      alert(simulador.proyeccionId ? '✅ Proyección actualizada exitosamente' : '✅ Proyección guardada exitosamente');
      simulador.setEditandoCarrera(null);
      simulador.setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: {} }));
      simulador.setRamosInscritosSimulacion((prev) => ({ ...prev, [codCarrera]: new Set() }));
      simulador.setProyeccionId(null);
      onCancelarEdicion?.();
    } catch (err: any) {
      console.error('❌ Error al guardar:', err);
      alert(`❌ Error al guardar la proyección.\n\nDetalles: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {simulador.proyeccionId ? '✏️ Editar Proyección Curricular' : '🎯 Simulador de Proyección Curricular'}
        </h1>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 p-3 rounded-r-lg">
          <p className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">RUT:</span> {data.rut}
          </p>
          <p className="text-xs text-gray-600">
            💡 Arrastra los <span className="font-semibold text-indigo-600">ramos pendientes</span> entre semestres para reorganizar tu malla curricular
          </p>
        </div>
      </div>

      <button
        onClick={() => {
          const carrera = data.carreras[0];
          if (carrera) simulador.simularOptimista(carrera.codigo, carrera.malla);
        }}
        className="mb-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-lg shadow-md transition-all hover:shadow-lg"
      >
        🚀 Simulación Optimista
      </button>

      {data.carreras.map((carrera, idx) => {
        const enEdicion = simulador.editandoCarrera === carrera.codigo;
        const planActual = simulador.planPorCarrera[carrera.codigo] ?? {};
        const inscritosSimulados = simulador.ramosInscritosSimulacion[carrera.codigo] ?? new Set();
        const totalCambios = Object.values(planActual).reduce((acc, v) => acc + (v?.length ?? 0), 0);
        const semestresAgrupados = simulador.agruparMallaPorSemestre(carrera.malla);
        const maxSemestreOriginal = Math.max(...semestresAgrupados.map((s) => s.nivel), 0);
        const maxSemestreVisible = simulador.maxSemestreVisiblePorCarrera[carrera.codigo] ?? maxSemestreOriginal;
        const semestresAMostrar = Array.from({ length: maxSemestreVisible }, (_, i) => i + 1);

        return (
          <div key={idx} className="mb-8">
            <CarrerHeader
              carrera={carrera}
              enEdicion={enEdicion}
              totalCambios={totalCambios}
              totalInscritosSimulados={inscritosSimulados.size}
              proyeccionId={simulador.proyeccionId}
              onStartPlanning={() => simulador.setEditandoCarrera(carrera.codigo)}
              onSimulate={() => simularInscripcion(carrera.codigo)}
              onCancel={() => simulador.cancelar(carrera.codigo, onCancelarEdicion)}
              onSave={() => guardar(carrera.codigo)}
            />

            <div className="bg-white rounded-b-xl shadow-lg p-4">
              <div className="overflow-x-auto overflow-y-visible relative isolate">
                <div className="flex gap-3 min-w-max pb-4">
                  {semestresAMostrar.map((nivel) => {
                    const asignaturas = semestresAgrupados.find((s) => s.nivel === nivel)?.asignaturas ?? [];
                    const ramosMovidosAqui = (planActual[nivel] ?? [])
                      .map((codigo) => carrera.malla.find((a) => a.codigo === codigo))
                      .filter(Boolean) as Asignatura[];

                    const todosRamosEnPlan = new Set(Object.values(planActual).flatMap((codigos) => codigos));
                    const ramosOriginales = asignaturas.filter((r) => !todosRamosEnPlan.has(r.codigo) && simulador.noCursada(r));
                    const todosRamos = [...ramosOriginales, ...ramosMovidosAqui].filter((r) => simulador.noCursada(r));

                    const creditosSemestre = todosRamos.reduce((sum, r) => {
                      if (r.status === 'INSCRITO' || inscritosSimulados.has(r.codigo)) {
                        return sum + r.creditos;
                      }
                      return sum;
                    }, 0);

                    return (
                      <SemesterCard
                        key={nivel}
                        nivel={nivel}
                        totalAsignaturas={todosRamos.length}
                        creditosSemestre={creditosSemestre}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (enEdicion && simulador.draggingRamo) {
                            simulador.moverRamo(carrera.codigo, simulador.draggingRamo, nivel, carrera.malla);
                            simulador.setDraggingRamo(null);
                          }
                        }}
                        isEditing={enEdicion}
                        codCarrera={carrera.codigo}
                        levantamientoActual={simulador.levantamientos[carrera.codigo]?.[nivel] ?? null}
                        onToggleLevantamiento={(tipo) => simulador.toggleLevantamiento(carrera.codigo, nivel, tipo)}
                        limiteCreditos={simulador.obtenerLimiteCreditos(carrera.codigo, nivel)}
                      >
                        {todosRamos.length === 0 ? (
                          <div className="text-xs text-gray-400 text-center py-8">
                            {enEdicion ? '🎯 Arrastra ramos aquí' : 'Sin asignaturas'}
                          </div>
                        ) : (
                          todosRamos.map((asig) => {
                            const ramoId = `${nivel}-${asig.codigo}`;
                            const nombresPrereq = simulador.obtenerNombresPrereq(asig.prereq, carrera.malla);
                            const fueMovido = asig.nivel !== nivel || ramosMovidosAqui.some((r) => r.codigo === asig.codigo);
                            const cumple = !fueMovido || simulador.cumplePrereq(asig, planActual, nivel, carrera.malla, carrera.codigo);
                            const esMovible = simulador.noCursada(asig) && enEdicion;
                            const estaInscritoSimulado = inscritosSimulados.has(asig.codigo);

                            return (
                              <AsignatureCard
                                key={asig.codigo}
                                asig={asig}
                                nivel={nivel}
                                isEditing={enEdicion}
                                isMovable={esMovible}
                                isSimulated={estaInscritoSimulado}
                                isMoved={fueMovido}
                                cumplePrereq={cumple}
                                onDragStart={() => esMovible && simulador.setDraggingRamo(asig.codigo)}
                                onSimulateInscription={() => simulador.toggleInscripcionSimulada(carrera.codigo, asig.codigo, carrera.malla)}
                                onMouseEnter={() => simulador.setHoveredAsignatura(ramoId)}
                                onMouseLeave={() => simulador.setHoveredAsignatura(null)}
                                hoveredAsignatura={simulador.hoveredAsignatura}
                                ramoId={ramoId}
                              >
                                {asig.prereq && simulador.hoveredAsignatura === ramoId && (
                                  <PrerequisiteTooltip
                                    prerequisitos={nombresPrereq}
                                    cumple={cumple}
                                    noCursada={simulador.noCursada(asig)}
                                  />
                                )}
                              </AsignatureCard>
                            );
                          })
                        )}
                      </SemesterCard>
                    );
                  })}
                  {enEdicion && (
                    <div className="flex-shrink-0 w-32 flex items-center justify-center">
                      <button
                        onClick={() => simulador.agregarSemestre(carrera.codigo, maxSemestreOriginal)}
                        className="w-16 h-16 rounded-lg bg-gradient-to-br from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 shadow-md flex items-center justify-center text-white font-bold text-2xl transition-all hover:shadow-lg"
                        title="Agregar semestre"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <UsageGuide enEdicion={enEdicion} />
          </div>
        );
      })}
    </div>
  );
};

export default SimuladorAvance;
