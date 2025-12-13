import React, { useState, useEffect } from 'react';
import axios from 'axios';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  status: string;
  intento: number;
};

type CarreraDto = {
  codigo: string;
  carrera: string;
  catalogo: string;
  malla: Asignatura[];
};

export type AuthDataDto = {
  rut: string;
  carreras: CarreraDto[];
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
  type Plan = Record<number, string[]>;
  const [planPorCarrera, setPlanPorCarrera] = useState<Record<string, Plan>>({});
  const [editandoCarrera, setEditandoCarrera] = useState<string | null>(null);
  const [draggingRamo, setDraggingRamo] = useState<string | null>(null);
  const [hoveredAsignatura, setHoveredAsignatura] = useState<string | null>(null);
  // Ramos marcados como "inscritos en simulación" para permitir mover sus dependientes
  const [ramosInscritosSimulacion, setRamosInscritosSimulacion] = useState<Record<string, Set<string>>>({});
  const [proyeccionId, setProyeccionId] = useState<number | null>(null);

  // Cargar proyección al montar el componente si se está editando
  useEffect(() => {
    if (proyeccionEditar) {
      cargarProyeccionParaEditar(proyeccionEditar);
    }
  }, [proyeccionEditar]);

  const cargarProyeccionParaEditar = (proyeccion: ProyeccionEditar) => {
    const carrera = data.carreras.find(c => c.codigo === proyeccion.codigo);
    if (!carrera) return;

    setProyeccionId(proyeccion.id_proyeccion);
    setEditandoCarrera(proyeccion.codigo);

    // Construir el plan a partir de la proyección
    const planCargado: Record<number, string[]> = {};
    const inscritosSimulados = new Set<string>();

    proyeccion.semestres.forEach(semestre => {
      semestre.ramos.forEach(ramo => {
        // Si el ramo está en un semestre diferente a su nivel original, está movido
        if (ramo.nivel !== semestre.semestre) {
          if (!planCargado[semestre.semestre]) {
            planCargado[semestre.semestre] = [];
          }
          planCargado[semestre.semestre].push(ramo.codigo);
        }

        // Si el ramo está marcado como PROYECTADO, agregarlo a inscritosSimulados
        if (ramo.status === 'PROYECTADO') {
          inscritosSimulados.add(ramo.codigo);
        }
      });
    });

    setPlanPorCarrera(prev => ({ ...prev, [proyeccion.codigo]: planCargado }));
    setRamosInscritosSimulacion(prev => ({ ...prev, [proyeccion.codigo]: inscritosSimulados }));
  };

  const noCursada = (a: Asignatura) => a.status !== 'APROBADO' && a.status !== 'INSCRITO';

  const parsePrereq = (s: string) =>
    (s || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  // Agrupa TODA la malla por semestre (incluye aprobados, inscritos y pendientes)
  const agruparMallaPorSemestre = (malla: Asignatura[]) => {
    const sem: Record<number, Asignatura[]> = {};
    malla.forEach((a) => {
      (sem[a.nivel] ||= []).push(a);
    });
    return Object.keys(sem)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({ nivel, asignaturas: sem[nivel] }));
  };

  const aprobadaOPlanAnterior = (
    codigoReq: string,
    plan: Plan,
    nivelDestino: number,
    malla: Asignatura[],
    codCarrera: string
  ) => {
    const req = malla.find((a) => a.codigo === codigoReq);
    const yaAprob = req && (req.status === 'APROBADO' || req.status === 'INSCRITO');
    if (yaAprob) return true;

    // Verificar si está marcado como "inscrito en simulación"
    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();
    if (inscritosSimulados.has(codigoReq)) return true;

    for (const [nivStr, cods] of Object.entries(plan)) {
      const niv = Number(nivStr);
      if (niv < nivelDestino && (cods ?? []).includes(codigoReq)) return true;
    }
    return false;
  };

  const cumplePrereq = (a: Asignatura, plan: Plan, nivelDestino: number, malla: Asignatura[], codCarrera: string) => {
    const reqs = parsePrereq(a.prereq);
    return reqs.every((cod) => aprobadaOPlanAnterior(cod, plan, nivelDestino, malla, codCarrera));
  };

  const obtenerNombresPrereq = (codigosPrereq: string, malla: Asignatura[]): string => {
    if (!codigosPrereq) return '';
    const codigos = codigosPrereq.split(',').map((c) => c.trim());
    const nombres = codigos.map((codigo) => {
      const asignatura = malla.find((a) => a.codigo === codigo);
      return asignatura ? asignatura.asignatura : codigo;
    });
    return nombres.join(', ');
  };

  const obtenerNivelActualRamo = (codigo: string, nivelOriginal: number, plan: Plan): number => {
    // Buscar en qué nivel está actualmente el ramo en el plan
    for (const [nivStr, cods] of Object.entries(plan)) {
      if ((cods ?? []).includes(codigo)) {
        return Number(nivStr);
      }
    }
    // Si no está en el plan, está en su nivel original
    return nivelOriginal;
  };

  // Nueva función: Calcular créditos totales de un semestre (solo ramos inscritos o en simulación)
  const calcularCreditosSemestre = (
    nivel: number, 
    plan: Plan, 
    malla: Asignatura[], 
    codCarrera: string
  ): number => {
    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();
    
    // Obtener todos los ramos del semestre
    const ramosEnSemestre = malla.filter((a) => {
      const nivelActual = obtenerNivelActualRamo(a.codigo, a.nivel, plan);
      return nivelActual === nivel;
    });
    
    // Sumar solo los créditos de ramos inscritos o marcados como inscritos en simulación
    return ramosEnSemestre.reduce((total, asig) => {
      const estaInscrito = asig.status === 'INSCRITO';
      const estaInscritoSimulado = inscritosSimulados.has(asig.codigo);
      
      // Solo contar si está inscrito o marcado como inscrito en simulación
      if (estaInscrito || estaInscritoSimulado) {
        return total + asig.creditos;
      }
      return total;
    }, 0);
  };

  const moverRamo = (
    codCarrera: string,
    codigo: string,
    nivelDestino: number,
    malla: Asignatura[]
  ) => {
    const planActual = planPorCarrera[codCarrera] ?? {};
    const asig = malla.find((a) => a.codigo === codigo);
    if (!asig || !noCursada(asig)) return;

    // Obtener el nivel actual del ramo (considerando movimientos previos)
    const nivelActual = obtenerNivelActualRamo(codigo, asig.nivel, planActual);

    // Si es el mismo nivel, no hacer nada
    if (nivelActual === nivelDestino) return;

    // Crear un plan temporal para validar prerequisitos y créditos
    const planTemp = { ...planActual };
    
    // Remover el ramo de su posición actual en el plan temporal
    Object.keys(planTemp).forEach((nivStr) => {
      const niv = Number(nivStr);
      planTemp[niv] = (planTemp[niv] ?? []).filter((c) => c !== codigo);
      if (planTemp[niv].length === 0) {
        delete planTemp[niv];
      }
    });

    // Calcular créditos actuales del semestre destino (sin incluir el ramo que vamos a mover)
    const creditosActualesSemestre = calcularCreditosSemestre(nivelDestino, planTemp, malla, codCarrera);
    
    // Validar que no se excedan los 30 créditos (solo si el ramo se va a marcar como inscrito)
    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();
    const seraInscrito = inscritosSimulados.has(codigo);
    
    if (seraInscrito && creditosActualesSemestre + asig.creditos > 30) {
      alert(
        `❌ No se puede mover "${asig.asignatura}" al semestre ${nivelDestino}.\n\n` +
        `Créditos inscritos en semestre ${nivelDestino}: ${creditosActualesSemestre} SCT\n` +
        `Créditos del ramo: ${asig.creditos} SCT\n` +
        `Total resultante: ${creditosActualesSemestre + asig.creditos} SCT\n\n` +
        `⚠️ Máximo permitido: 30 SCT por semestre`
      );
      return;
    }

    // Agregar el ramo al nivel destino en el plan temporal
    planTemp[nivelDestino] = [...(planTemp[nivelDestino] ?? []), codigo];

    // Validar prerequisitos con el plan temporal
    if (!cumplePrereq(asig, planTemp, nivelDestino, malla, codCarrera)) {
      alert(
        `❌ No se puede mover "${asig.asignatura}" al semestre ${nivelDestino}.\nNo cumple con los prerequisitos necesarios.`
      );
      return;
    }

    // Si la validación pasó, actualizar el estado
    setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: planTemp }));
  };

  const cancelar = (codCarrera: string) => {
    setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: {} }));
    setRamosInscritosSimulacion((prev) => ({ ...prev, [codCarrera]: new Set() }));
    setEditandoCarrera(null);
    setProyeccionId(null);
    if (onCancelarEdicion) {
      onCancelarEdicion();
    }
  };

  const toggleInscripcionSimulada = (codCarrera: string, codigo: string, malla: Asignatura[]) => {
    const asig = malla.find((a) => a.codigo === codigo);
    if (!asig) return;
    
    const inscritosActuales = ramosInscritosSimulacion[codCarrera] ?? new Set();
    const planActual = planPorCarrera[codCarrera] ?? {};
    const nivelActual = obtenerNivelActualRamo(codigo, asig.nivel, planActual);
    
    // Si ya está marcado, simplemente desmarcarlo
    if (inscritosActuales.has(codigo)) {
      setRamosInscritosSimulacion((prev) => {
        const nuevosInscritos = new Set(prev[codCarrera] ?? new Set());
        nuevosInscritos.delete(codigo);
        return { ...prev, [codCarrera]: nuevosInscritos };
      });
      return;
    }
    
    // Si se va a marcar como inscrito, validar límite de créditos
    const creditosActualesSemestre = calcularCreditosSemestre(nivelActual, planActual, malla, codCarrera);
    
    if (creditosActualesSemestre + asig.creditos > 30) {
      alert(
        `❌ No se puede inscribir "${asig.asignatura}" en semestre ${nivelActual}.\n\n` +
        `Créditos inscritos actuales: ${creditosActualesSemestre} SCT\n` +
        `Créditos del ramo: ${asig.creditos} SCT\n` +
        `Total resultante: ${creditosActualesSemestre + asig.creditos} SCT\n\n` +
        `⚠️ Máximo permitido: 30 SCT por semestre`
      );
      return;
    }
    
    // Marcar como inscrito
    setRamosInscritosSimulacion((prev) => {
      const nuevosInscritos = new Set(prev[codCarrera] ?? new Set());
      nuevosInscritos.add(codigo);
      return { ...prev, [codCarrera]: nuevosInscritos };
    });
  };

  const simularInscripcion = (codCarrera: string) => {
    const plan = planPorCarrera[codCarrera] ?? {};
    const carrera = data.carreras.find((c) => c.codigo === codCarrera);
    if (!carrera) return;

    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();

    // Construir resumen de la inscripción simulada
    let mensaje = '📚 SIMULACIÓN DE INSCRIPCIÓN\n\n';

    // Mostrar ramos marcados como inscritos en simulación
    if (inscritosSimulados.size > 0) {
      mensaje += '🟣 RAMOS MARCADOS COMO INSCRITOS (SIMULACIÓN):\n';
      Array.from(inscritosSimulados).forEach((codigo) => {
        const asig = carrera.malla.find((a) => a.codigo === codigo);
        if (asig) {
          mensaje += `  ✓ ${asig.asignatura} (${asig.codigo}) - Nivel ${asig.nivel}\n`;
        }
      });
      mensaje += '\n';
    }
    
    // Recorrer todos los semestres ordenados
    const semestresOrdenados = Object.keys(plan)
      .map(Number)
      .sort((a, b) => a - b);

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
              const cumple = cumplePrereq(asig, plan, nivel, carrera.malla, carrera.codigo);
              const icono = cumple ? '✅' : '❌';
              mensaje += `  ${icono} ${asig.asignatura} (${asig.codigo}) - ${asig.creditos} SCT\n`;
            }
          });
          mensaje += '\n';
        }
      });
    }

    // Calcular totales
    const totalAsignaturas = semestresOrdenados.reduce(
      (acc, nivel) => acc + (plan[nivel]?.length ?? 0),
      0
    );

    const creditosTotales = semestresOrdenados.reduce((acc, nivel) => {
      const codigos = plan[nivel] ?? [];
      return (
        acc +
        codigos.reduce((sum, codigo) => {
          const asig = carrera.malla.find((a) => a.codigo === codigo);
          return sum + (asig?.creditos ?? 0);
        }, 0)
      );
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
    const plan = planPorCarrera[codCarrera] ?? {};
    const carrera = data.carreras.find((c) => c.codigo === codCarrera);
    if (!carrera) return;

    // Obtener los ramos marcados como proyectados en la simulación
    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();

    // Construir el plan completo incluyendo los ramos en su posición original
    const planCompleto: Record<number, Asignatura[]> = {};

    // Primero, agregar todos los ramos en sus posiciones originales
    carrera.malla.forEach((asig) => {
      if (!planCompleto[asig.nivel]) {
        planCompleto[asig.nivel] = [];
      }
      planCompleto[asig.nivel].push(asig);
    });

    // Luego, aplicar los cambios del plan
    Object.entries(plan).forEach(([nivelStr, codigos]) => {
      const nivel = Number(nivelStr);
      codigos.forEach((codigo) => {
        const asig = carrera.malla.find((a) => a.codigo === codigo);
        if (asig) {
          // Remover de su posición original
          Object.keys(planCompleto).forEach((n) => {
            planCompleto[Number(n)] = planCompleto[Number(n)].filter(
              (a) => a.codigo !== codigo
            );
          });
          // Agregar en la nueva posición (mantener nivel original de asig.nivel)
          if (!planCompleto[nivel]) {
            planCompleto[nivel] = [];
          }
          // NO sobrescribir el nivel original - mantener asig.nivel
          planCompleto[nivel].push({ ...asig });
        }
      });
    });

    try {
      const payload = {
        rut: data.rut,
        codigo: carrera.codigo,
        carrera: carrera.carrera,
        plan: Object.fromEntries(
          Object.entries(planCompleto)
            .filter(([_, asigs]) => asigs.length > 0)
            .map(([nivel, asigs]) => [
              nivel,
              asigs.map((asig) => {
                // Determinar el status: si está en inscritosSimulados y no tiene status previo, marcarlo como PROYECTADO
                let status = asig.status ?? 'NO CURSADO';
                if (inscritosSimulados.has(asig.codigo) && status === 'NO CURSADO') {
                  status = 'PROYECTADO';
                }
                
                return {
                  codigo: asig.codigo,
                  asignatura: asig.asignatura,
                  creditos: asig.creditos,
                  nivel: asig.nivel, // Mantener el nivel original del ramo
                  prereq: asig.prereq,
                  intento: asig.intento ?? 0,
                  status: status,
                  cursada: status === 'INSCRITO' || status === 'APROBADO',
                };
              }),
            ])
        ),
      };

      console.log('📤 Payload a enviar:', JSON.stringify(payload, null, 2));
      console.log('🔑 Proyección ID:', proyeccionId);

      // Si estamos editando, actualizar; si no, crear nueva
      const url = proyeccionId 
        ? `http://localhost:3000/proyeccion/actualizar/${proyeccionId}`
        : 'http://localhost:3000/proyeccion/guardar';
      
      console.log('🌐 URL:', url);
      console.log('📋 Método:', proyeccionId ? 'PUT' : 'POST');
      
      const response = proyeccionId
        ? await axios.put(url, payload)
        : await axios.post(url, payload);
      
      console.log('✅ Proyección guardada correctamente:', response.data);
      alert(proyeccionId ? '✅ Proyección actualizada exitosamente' : '✅ Proyección guardada exitosamente');

      setEditandoCarrera(null);
      setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: {} }));
      setRamosInscritosSimulacion((prev) => ({ ...prev, [codCarrera]: new Set() }));
      setProyeccionId(null);
      
      if (onCancelarEdicion) {
        onCancelarEdicion();
      }
    } catch (err: any) {
      console.error('❌ Error al guardar la proyección:', err);
      console.error('❌ Detalles del error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      alert(`❌ Error al guardar la proyección.\n\nDetalles: ${err.response?.data?.message || err.message}\n\nRevisa la consola para más información.`);
    }
  };

  const handleDragStart = (codigo: string) => {
    setDraggingRamo(codigo);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    codCarrera: string,
    nivelDestino: number,
    malla: Asignatura[]
  ) => {
    if (draggingRamo) {
      moverRamo(codCarrera, draggingRamo, nivelDestino, malla);
      setDraggingRamo(null);
    }
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {proyeccionId ? '✏️ Editar Proyección Curricular' : '🎯 Simulador de Proyección Curricular'}
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

      {data.carreras.map((carrera, idx) => {
        const enEdicion = editandoCarrera === carrera.codigo;
        const planActual = planPorCarrera[carrera.codigo] ?? {};
        const inscritosSimulados = ramosInscritosSimulacion[carrera.codigo] ?? new Set();

        // Contar cambios realizados
        const totalCambios = Object.values(planActual).reduce(
          (acc, v) => acc + (v?.length ?? 0),
          0
        );

        const totalInscritosSimulados = inscritosSimulados.size;
        const totalModificaciones = totalCambios + totalInscritosSimulados;

        // Agrupar toda la malla por semestre
        const semestresAgrupados = agruparMallaPorSemestre(carrera.malla);

        return (
          <div key={idx} className="mb-8">
            {/* Barra de carrera */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{carrera.carrera}</h2>
                <p className="text-indigo-100 text-sm mt-1">
                  Código: {carrera.codigo} | Catálogo: {carrera.catalogo}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {!enEdicion ? (
                  <button
                    onClick={() => setEditandoCarrera(carrera.codigo)}
                    className="text-sm px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50 shadow-md transition"
                  >
                    ✏️ Comenzar Planificación
                  </button>
                ) : (
                  <>
                    {totalModificaciones > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white bg-white/20 px-3 py-1.5 rounded-lg">
                          📝 {totalCambios} reorganizados
                        </span>
                        {totalInscritosSimulados > 0 && (
                          <span className="text-sm font-semibold text-white bg-purple-500/80 px-3 py-1.5 rounded-lg">
                            🟣 {totalInscritosSimulados} simulados
                          </span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => simularInscripcion(carrera.codigo)}
                      className="text-sm px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 shadow-md transition"
                      disabled={totalModificaciones === 0}
                    >
                      🎓 Simular Inscripción
                    </button>
                    <button
                      onClick={() => cancelar(carrera.codigo)}
                      className="text-sm px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30 transition"
                    >
                      ✕ Cancelar
                    </button>
                    <button
                      onClick={() => guardar(carrera.codigo)}
                      className="text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow-md transition"
                    >
                      {proyeccionId ? '💾 Actualizar Proyección' : '💾 Guardar Proyección'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Grid de semestres con toda la malla */}
            <div className="bg-white rounded-b-xl shadow-lg p-4">
              <div className="overflow-x-auto overflow-y-visible relative isolate">
                <div className="flex gap-3 min-w-max pb-4">
                  {semestresAgrupados.map(({ nivel, asignaturas }) => {
                    // Determinar qué ramos mostrar en este semestre
                    const ramosMovidosAqui = (planActual[nivel] ?? [])
                      .map((codigo) => carrera.malla.find((a) => a.codigo === codigo))
                      .filter(Boolean) as Asignatura[];

                    // Obtener TODOS los ramos que están en el plan (movidos a cualquier semestre)
                    const todosRamosEnPlan = new Set(
                      Object.values(planActual).flatMap((codigos) => codigos)
                    );

                    // Ramos originales que NO han sido movidos a ningún otro semestre
                    const ramosOriginales = asignaturas.filter(
                      (r) => !todosRamosEnPlan.has(r.codigo)
                    );

                    // Todos los ramos a mostrar (originales + movidos aquí)
                    const todosRamos = [...ramosOriginales, ...ramosMovidosAqui];

                    // Calcular créditos inscritos del semestre (solo inscritos o marcados como inscritos)
                    const inscritosSimuladosLocal = ramosInscritosSimulacion[carrera.codigo] ?? new Set();
                    const creditosSemestre = todosRamos.reduce((sum, r) => {
                      if (r.status === 'INSCRITO' || inscritosSimuladosLocal.has(r.codigo)) {
                        return sum + r.creditos;
                      }
                      return sum;
                    }, 0);
                    const creditosExcedidos = creditosSemestre > 30;
                    const creditosCasi = creditosSemestre >= 25 && creditosSemestre <= 30;

                    return (
                      <div
                        key={nivel}
                        className="flex-shrink-0 w-64"
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (enEdicion && draggingRamo) {
                            handleDrop(carrera.codigo, nivel, carrera.malla);
                          }
                        }}
                      >
                        <div className={`rounded-lg p-3 mb-3 shadow-md ${
                          creditosExcedidos 
                            ? 'bg-gradient-to-r from-red-500 to-red-600' 
                            : creditosCasi 
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                            : 'bg-gradient-to-r from-cyan-500 to-teal-400'
                        }`}>
                          <h3 className="text-sm font-bold text-white text-center">
                            📅 Semestre {nivel}
                          </h3>
                          <p className="text-xs text-center text-white/80 mt-0.5">
                            {todosRamos.length} asignaturas
                          </p>
                          <div className={`text-xs font-bold text-center mt-1 px-2 py-1 rounded ${
                            creditosExcedidos 
                              ? 'bg-red-900/30 text-white' 
                              : creditosCasi
                              ? 'bg-orange-900/30 text-white'
                              : 'bg-white/20 text-white'
                          }`}>
                            {creditosSemestre} / 30 SCT
                            {creditosExcedidos && ' ⚠️'}
                          </div>
                        </div>

                        {/* Zona de drop */}
                        <div
                          className={`min-h-[100px] space-y-2 p-2 rounded-lg border-2 transition ${
                            enEdicion && draggingRamo
                              ? 'border-teal-400 bg-teal-50/50 border-dashed'
                              : 'border-transparent bg-transparent'
                          }`}
                        >
                          {todosRamos.length === 0 && (
                            <div className="text-xs text-gray-400 text-center py-8">
                              {enEdicion ? '🎯 Arrastra ramos aquí' : 'Sin asignaturas'}
                            </div>
                          )}

                          {todosRamos.map((asig) => {
                            const ramoId = `${nivel}-${asig.codigo}`;
                            const nombresPrereq = obtenerNombresPrereq(asig.prereq, carrera.malla);

                            // Determinar si fue movido
                            const fueMovido =
                              asig.nivel !== nivel ||
                              ramosMovidosAqui.some((r) => r.codigo === asig.codigo);

                            // Validar prerequisitos si fue movido o si está en edición
                            const cumple =
                              !fueMovido || cumplePrereq(asig, planActual, nivel, carrera.malla, carrera.codigo);

                            // Determinar si es movible
                            const esMovible = noCursada(asig) && enEdicion;

                            // Verificar si está marcado como inscrito en simulación
                            const inscritosSimulados = ramosInscritosSimulacion[carrera.codigo] ?? new Set();
                            const estaInscritoSimulado = inscritosSimulados.has(asig.codigo);

                            // Determinar colores
                            let bgColor, borderColor, codigoBadge;
                            if (asig.status === 'APROBADO') {
                              bgColor = 'bg-gradient-to-br from-green-50 to-emerald-50';
                              borderColor = 'border-emerald-500';
                              codigoBadge = 'bg-emerald-100 text-emerald-700';
                            } else if (asig.status === 'INSCRITO') {
                              bgColor = 'bg-gradient-to-br from-blue-50 to-sky-50';
                              borderColor = 'border-sky-500';
                              codigoBadge = 'bg-sky-100 text-sky-700';
                            } else if (estaInscritoSimulado) {
                              bgColor = 'bg-gradient-to-br from-purple-50 to-violet-50';
                              borderColor = 'border-purple-500';
                              codigoBadge = 'bg-purple-100 text-purple-700';
                            } else if (cumple) {
                              bgColor = 'bg-gradient-to-br from-teal-50 to-cyan-50';
                              borderColor = 'border-teal-400';
                              codigoBadge = 'bg-teal-100 text-teal-700';
                            } else {
                              bgColor = 'bg-gradient-to-br from-orange-50 to-red-50';
                              borderColor = 'border-orange-400';
                              codigoBadge = 'bg-orange-100 text-orange-700';
                            }

                            return (
                              <div
                                key={asig.codigo}
                                draggable={esMovible}
                                onDragStart={() => esMovible && handleDragStart(asig.codigo)}
                                onMouseEnter={() => setHoveredAsignatura(ramoId)}
                                onMouseLeave={() => setHoveredAsignatura(null)}
                                className={`relative z-10 rounded-lg p-3 shadow-md hover:shadow-lg hover:z-20 transition-all duration-200 ${bgColor} border-l-4 ${borderColor} ${
                                  esMovible ? 'cursor-move hover:scale-[1.02]' : 'cursor-default'
                                }`}
                              >
                                <div className="flex items-start justify-between mb-2 gap-1 flex-wrap">
                                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${codigoBadge}`}>
                                    {asig.codigo}
                                  </span>
                                  <span className="text-[10px] font-semibold text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                                    {asig.creditos} SCT
                                  </span>
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                      asig.status === 'APROBADO' || asig.status === 'INSCRITO'
                                        ? 'bg-green-100 text-green-700 border-green-300'
                                        : 'bg-gray-100 text-gray-700 border-gray-300'
                                    }`}
                                  >
                                    {asig.status}
                                  </span>
                                </div>

                                <h4 className="text-xs font-semibold text-gray-800 leading-tight mb-1">
                                  {asig.asignatura}
                                </h4>

                                {/* Botón para marcar como inscrito en simulación */}
                                {noCursada(asig) && enEdicion && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleInscripcionSimulada(carrera.codigo, asig.codigo, carrera.malla);
                                    }}
                                    className={`w-full text-[10px] font-bold px-2 py-1 rounded mt-2 transition ${
                                      estaInscritoSimulado
                                        ? 'bg-purple-500 text-white hover:bg-purple-600'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    title={
                                      estaInscritoSimulado
                                        ? 'Click para desmarcar como inscrito'
                                        : 'Click para simular inscripción'
                                    }
                                  >
                                    {estaInscritoSimulado ? '✓ Inscrito (simulado)' : '○ Simular inscripción'}
                                  </button>
                                )}

                                {/* Badges informativos */}
                                <div className="flex items-center gap-1 flex-wrap mt-2">
                                  {fueMovido && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">
                                      📍 Movido (S{asig.nivel}→S{nivel})
                                    </span>
                                  )}
                                  {!cumple && noCursada(asig) && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
                                      ⚠️ Sin prereq
                                    </span>
                                  )}
                                  {asig.intento > 0 && (
                                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                                      {asig.intento}° intento
                                    </span>
                                  )}
                                  {esMovible && (
                                    <span className="text-[9px] text-gray-500">🔄 Arrastrable</span>
                                  )}
                                </div>

                                {/* Tooltip de prerequisitos */}
                                {asig.prereq && hoveredAsignatura === ramoId && (
                                  <div className="absolute left-full ml-2 top-0 z-[999] w-64 bg-white border-2 border-teal-400 rounded-lg shadow-2xl p-3">
                                    <div className="text-xs font-bold text-teal-700 mb-2 border-b border-teal-200 pb-1">
                                      📋 Prerequisitos:
                                    </div>
                                    <div className="text-[11px] text-gray-700 leading-relaxed">
                                      {nombresPrereq}
                                    </div>
                                    {!cumple && noCursada(asig) && (
                                      <div className="mt-2 text-[11px] text-red-600 font-semibold">
                                        ⚠️ No cumple prerequisitos en este semestre
                                      </div>
                                    )}
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
            </div>

            {/* Leyenda */}
            {enEdicion && (
              <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4">
                <p className="text-sm font-bold text-indigo-800 mb-3">💡 Guía de uso:</p>
                <div className="grid md:grid-cols-2 gap-2 text-xs text-gray-700">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600">✓</span>
                    <span>Solo los ramos <strong>NO CURSADOS</strong> son arrastrables</span>
                  </div>
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
                    <span className="text-purple-600">✓</span>
                    <span>
                      Borde <strong className="text-purple-600">morado</strong>: Inscrito en simulación (permite mover dependientes)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-teal-600">✓</span>
                    <span>
                      Borde <strong className="text-teal-600">teal</strong>: Cumple prerequisitos
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">⚠</span>
                    <span>
                      Borde <strong className="text-orange-600">naranja</strong>: Falta prerequisitos
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">📍</span>
                    <span>
                      Badge <strong>Movido</strong>: Ramo reubicado de su semestre original
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600">🎓</span>
                    <span>
                      <strong>Simular Inscripción</strong>: Previsualiza tu plan reorganizado
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-600">💡</span>
                    <span>
                      Puedes mover ramos <strong>hacia adelante o atrás</strong> en los semestres
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600">⚠️</span>
                    <span>
                      <strong className="text-red-600">Máximo 30 SCT</strong> por semestre (límite reglamentario)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-600">📊</span>
                    <span>
                      El contador muestra solo créditos <strong>inscritos</strong> o <strong>marcados para inscripción</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">🔶</span>
                    <span>
                      Encabezado <strong className="text-orange-600">naranja</strong>: 25-30 SCT inscritos (casi en el límite)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-600">🔴</span>
                    <span>
                      Encabezado <strong className="text-red-600">rojo</strong>: &gt;30 SCT inscritos (excede el límite)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-600">○</span>
                    <span>
                      Click en <strong>"Simular inscripción"</strong> dentro de un ramo para marcarlo como inscrito temporalmente
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SimuladorAvance;
