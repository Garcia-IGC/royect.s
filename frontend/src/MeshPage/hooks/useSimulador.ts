import { useState, useCallback } from 'react';
import { proyeccionService } from '../services/proyeccionService';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  status: string;
  intento: number;
};

type Plan = Record<number, string[]>;

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

type LevantamientoTipo = 'creditos' | 'dispersion' | 'prerequisitos' | null;

type LevantamientosPorSemestre = Record<string, Record<number, LevantamientoTipo>>;

export const useSimulador = (data: any) => {
  const [planPorCarrera, setPlanPorCarrera] = useState<Record<string, Plan>>({});
  const [editandoCarrera, setEditandoCarrera] = useState<string | null>(null);
  const [draggingRamo, setDraggingRamo] = useState<string | null>(null);
  const [hoveredAsignatura, setHoveredAsignatura] = useState<string | null>(null);
  const [ramosInscritosSimulacion, setRamosInscritosSimulacion] = useState<Record<string, Set<string>>>({});
  const [proyeccionId, setProyeccionId] = useState<number | null>(null);
  const [levantamientos, setLevantamientos] = useState<LevantamientosPorSemestre>({});
  const [ramoSinPrereqPorSemestre, setRamoSinPrereqPorSemestre] = useState<Record<string, Record<number, string>>>({});
  const [maxSemestreVisiblePorCarrera, setMaxSemestreVisiblePorCarrera] = useState<Record<string, number>>({});

  const noCursada = useCallback((a: Asignatura) => a.status !== 'APROBADO' && a.status !== 'INSCRITO', []);
  
  const parsePrereq = useCallback((s: string) =>
    (s || '').split(',').map((x) => x.trim()).filter(Boolean),
    []
  );

  const obtenerNivelActualRamo = useCallback((codigo: string, nivelOriginal: number, plan: Plan): number => {
    for (const [nivStr, cods] of Object.entries(plan)) {
      if ((cods ?? []).includes(codigo)) return Number(nivStr);
    }
    return nivelOriginal;
  }, []);

  const calcularCreditosSemestre = useCallback((
    nivel: number,
    plan: Plan,
    malla: Asignatura[],
    codCarrera: string
  ): number => {
    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();
    const ramosEnSemestre = malla.filter((a) => obtenerNivelActualRamo(a.codigo, a.nivel, plan) === nivel);
    
    return ramosEnSemestre.reduce((total, asig) => {
      if (asig.status === 'INSCRITO' || inscritosSimulados.has(asig.codigo)) {
        return total + asig.creditos;
      }
      return total;
    }, 0);
  }, [ramosInscritosSimulacion, obtenerNivelActualRamo]);

  const obtenerLimiteCreditos = useCallback((codCarrera: string, nivel: number): number => {
    const levantamiento = levantamientos[codCarrera]?.[nivel];
    return levantamiento === 'creditos' ? 35 : 30;
  }, [levantamientos]);

  const tieneDispersinLevantada = useCallback((codCarrera: string, nivel: number): boolean => {
    return levantamientos[codCarrera]?.[nivel] === 'dispersion';
  }, [levantamientos]);

  const tienePrerequisitosLevantados = useCallback((codCarrera: string, nivel: number): boolean => {
    return levantamientos[codCarrera]?.[nivel] === 'prerequisitos';
  }, [levantamientos]);

  const obtenerRamoSinPrereqPermitido = useCallback((codCarrera: string, nivel: number): string | null => {
    return ramoSinPrereqPorSemestre[codCarrera]?.[nivel] ?? null;
  }, [ramoSinPrereqPorSemestre]);

  const aprobadaOPlanAnterior = useCallback((
    codigoReq: string,
    plan: Plan,
    nivelDestino: number,
    malla: Asignatura[],
    codCarrera: string
  ) => {
    const req = malla.find((a) => a.codigo === codigoReq);
    if (req && (req.status === 'APROBADO' || req.status === 'INSCRITO')) return true;

    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();
    // Solo contar como aprobado si está inscrito en un semestre ANTERIOR
    if (inscritosSimulados.has(codigoReq)) {
      const nivelDelRamoInscrito = obtenerNivelActualRamo(codigoReq, req?.nivel ?? 999, plan);
      if (nivelDelRamoInscrito < nivelDestino) return true;
    }

    for (const [nivStr, cods] of Object.entries(plan)) {
      if (Number(nivStr) < nivelDestino && (cods ?? []).includes(codigoReq)) return true;
    }
    return false;
  }, [ramosInscritosSimulacion, obtenerNivelActualRamo]);

  const cumplePrereq = useCallback((
    a: Asignatura,
    plan: Plan,
    nivelDestino: number,
    malla: Asignatura[],
    codCarrera: string
  ) => {
    const reqs = parsePrereq(a.prereq);
    return reqs.every((cod) => aprobadaOPlanAnterior(cod, plan, nivelDestino, malla, codCarrera));
  }, [parsePrereq, aprobadaOPlanAnterior]);

  const obtenerNombresPrereq = useCallback((codigosPrereq: string, malla: Asignatura[]): string => {
    if (!codigosPrereq) return '';
    const codigos = codigosPrereq.split(',').map((c) => c.trim());
    const nombres = codigos.map((codigo) => {
      const asignatura = malla.find((a) => a.codigo === codigo);
      return asignatura ? asignatura.asignatura : codigo;
    });
    return nombres.join(', ');
  }, []);

  const agruparMallaPorSemestre = useCallback((malla: Asignatura[]) => {
    const sem: Record<number, Asignatura[]> = {};
    malla.forEach((a) => {
      (sem[a.nivel] ||= []).push(a);
    });
    return Object.keys(sem)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({ nivel, asignaturas: sem[nivel] }));
  }, []);

  const validarDiferenciaNiveles = useCallback((
    nivelRamoActual: number,
    nivelDestino: number,
    plan: Plan,
    malla: Asignatura[],
    codCarrera: string
  ): { valido: boolean; mensaje?: string } => {
    // Si el levantamiento de dispersión está activo, no validar diferencia
    if (tieneDispersinLevantada(codCarrera, nivelDestino)) {
      return { valido: true };
    }

    const ramosEnSemestre = malla.filter((a) => obtenerNivelActualRamo(a.codigo, a.nivel, plan) === nivelDestino);
    
    if (ramosEnSemestre.length === 0) return { valido: true };

    const nivelesOriginales = ramosEnSemestre.map((a) => a.nivel);
    const nivelesConRamo = [...nivelesOriginales, nivelRamoActual];
    
    // Verificar si hay 2 o más ramos con diferencia >= 3
    for (let i = 0; i < nivelesConRamo.length; i++) {
      for (let j = i + 1; j < nivelesConRamo.length; j++) {
        if (Math.abs(nivelesConRamo[i] - nivelesConRamo[j]) >= 3) {
          return {
            valido: false,
            mensaje: `❌ No se puede inscribir ramos con diferencia de nivel >= 3 en el mismo semestre.\n\nRamos presentes: niveles ${[...new Set(nivelesConRamo)].sort((a, b) => a - b).join(', ')}\n⚠️ Diferencia máxima permitida: 2 niveles`,
          };
        }
      }
    }

    return { valido: true };
  }, [obtenerNivelActualRamo, tieneDispersinLevantada]);

  const moverRamo = useCallback((
    codCarrera: string,
    codigo: string,
    nivelDestino: number,
    malla: Asignatura[]
  ) => {
    const planActual = planPorCarrera[codCarrera] ?? {};
    const asig = malla.find((a) => a.codigo === codigo);
    if (!asig || !noCursada(asig)) return;

    const nivelActual = obtenerNivelActualRamo(codigo, asig.nivel, planActual);
    if (nivelActual === nivelDestino) return;

    const planTemp = { ...planActual };
    Object.keys(planTemp).forEach((nivStr) => {
      const niv = Number(nivStr);
      planTemp[niv] = (planTemp[niv] ?? []).filter((c) => c !== codigo);
      if (planTemp[niv].length === 0) delete planTemp[niv];
    });

    const creditosActualesSemestre = calcularCreditosSemestre(nivelDestino, planTemp, malla, codCarrera);
    const inscritosSimulados = ramosInscritosSimulacion[codCarrera] ?? new Set();
    const seraInscrito = inscritosSimulados.has(codigo);
    
    const limiteCreditos = obtenerLimiteCreditos(codCarrera, nivelDestino);
    if (seraInscrito && creditosActualesSemestre + asig.creditos > limiteCreditos) {
      alert(
        `❌ No se puede mover "${asig.asignatura}" al semestre ${nivelDestino}.\n\n` +
        `Créditos inscritos en semestre ${nivelDestino}: ${creditosActualesSemestre} SCT\n` +
        `Créditos del ramo: ${asig.creditos} SCT\n` +
        `Total resultante: ${creditosActualesSemestre + asig.creditos} SCT\n\n` +
        `⚠️ Máximo permitido: ${limiteCreditos} SCT por semestre`
      );
      return;
    }

    planTemp[nivelDestino] = [...(planTemp[nivelDestino] ?? []), codigo];

    const validacionNiveles = validarDiferenciaNiveles(asig.nivel, nivelDestino, planTemp, malla, codCarrera);
    if (!validacionNiveles.valido) {
      alert(validacionNiveles.mensaje);
      return;
    }

    if (!cumplePrereq(asig, planTemp, nivelDestino, malla, codCarrera)) {
      const ramoSinPrereqPermitido = obtenerRamoSinPrereqPermitido(codCarrera, nivelDestino);
      if (ramoSinPrereqPermitido !== codigo) {
        alert(`❌ No se puede mover "${asig.asignatura}" al semestre ${nivelDestino}.\nNo cumple con los prerequisitos necesarios.`);
        return;
      }
    }

    setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: planTemp }));
  }, [planPorCarrera, ramosInscritosSimulacion, noCursada, obtenerNivelActualRamo, calcularCreditosSemestre, obtenerLimiteCreditos, validarDiferenciaNiveles, cumplePrereq, obtenerRamoSinPrereqPermitido]);

  const toggleInscripcionSimulada = useCallback((codCarrera: string, codigo: string, malla: Asignatura[]) => {
    const asig = malla.find((a) => a.codigo === codigo);
    if (!asig) return;
    
    const inscritosActuales = ramosInscritosSimulacion[codCarrera] ?? new Set();
    const planActual = planPorCarrera[codCarrera] ?? {};
    const nivelActual = obtenerNivelActualRamo(codigo, asig.nivel, planActual);
    
    if (inscritosActuales.has(codigo)) {
      setRamosInscritosSimulacion((prev) => {
        const nuevosInscritos = new Set(prev[codCarrera] ?? new Set());
        nuevosInscritos.delete(codigo);
        return { ...prev, [codCarrera]: nuevosInscritos };
      });
      // Limpiar el ramo sin prereq si es el que se está desinscribiendo
      if (obtenerRamoSinPrereqPermitido(codCarrera, nivelActual) === codigo) {
        setRamoSinPrereqPorSemestre((prev) => {
          const nuevos = { ...prev, [codCarrera]: { ...prev[codCarrera] } };
          delete nuevos[codCarrera][nivelActual];
          return nuevos;
        });
      }
      return;
    }
    
    const limiteCreditos = obtenerLimiteCreditos(codCarrera, nivelActual);
    const creditosActualesSemestre = calcularCreditosSemestre(nivelActual, planActual, malla, codCarrera);
    
    if (creditosActualesSemestre + asig.creditos > limiteCreditos) {
      alert(
        `❌ No se puede inscribir "${asig.asignatura}" en semestre ${nivelActual}.\n\n` +
        `Créditos inscritos actuales: ${creditosActualesSemestre} SCT\n` +
        `Créditos del ramo: ${asig.creditos} SCT\n` +
        `Total resultante: ${creditosActualesSemestre + asig.creditos} SCT\n\n` +
        `⚠️ Máximo permitido: ${limiteCreditos} SCT por semestre`
      );
      return;
    }

    const validacionNiveles = validarDiferenciaNiveles(asig.nivel, nivelActual, planActual, malla, codCarrera);
    if (!validacionNiveles.valido) {
      alert(validacionNiveles.mensaje);
      return;
    }

    if (!cumplePrereq(asig, planActual, nivelActual, malla, codCarrera)) {
      const ramoSinPrereqPermitido = obtenerRamoSinPrereqPermitido(codCarrera, nivelActual);
      if (ramoSinPrereqPermitido !== null) {
        alert(`❌ Ya hay un ramo sin prerequisitos permitido en este semestre: ${malla.find((a) => a.codigo === ramoSinPrereqPermitido)?.asignatura}`);
        return;
      }
      
      // Permitir si el levantamiento de prerequisitos está activo
      if (tienePrerequisitosLevantados(codCarrera, nivelActual)) {
        setRamosInscritosSimulacion((prev) => {
          const nuevosInscritos = new Set(prev[codCarrera] ?? new Set());
          nuevosInscritos.add(codigo);
          return { ...prev, [codCarrera]: nuevosInscritos };
        });
        setRamoSinPrereqPorSemestre((prev) => {
          const nuevos = { ...prev, [codCarrera]: { ...prev[codCarrera], [nivelActual]: codigo } };
          return nuevos;
        });
        return;
      }

      alert(`❌ No se puede inscribir "${asig.asignatura}" en semestre ${nivelActual}.\nNo cumple con los prerequisitos necesarios.`);
      return;
    }
    
    setRamosInscritosSimulacion((prev) => {
      const nuevosInscritos = new Set(prev[codCarrera] ?? new Set());
      nuevosInscritos.add(codigo);
      return { ...prev, [codCarrera]: nuevosInscritos };
    });
  }, [ramosInscritosSimulacion, planPorCarrera, obtenerNivelActualRamo, calcularCreditosSemestre, obtenerLimiteCreditos, validarDiferenciaNiveles, cumplePrereq, obtenerRamoSinPrereqPermitido, tienePrerequisitosLevantados]);

  const cargarProyeccionParaEditar = useCallback((proyeccion: ProyeccionEditar) => {
    const carrera = data.carreras.find((c: any) => c.codigo === proyeccion.codigo);
    if (!carrera) return;

    setProyeccionId(proyeccion.id_proyeccion);
    setEditandoCarrera(proyeccion.codigo);

    const planCargado: Record<number, string[]> = {};
    const inscritosSimulados = new Set<string>();

    proyeccion.semestres.forEach(semestre => {
      semestre.ramos.forEach(ramo => {
        if (ramo.nivel !== semestre.semestre) {
          if (!planCargado[semestre.semestre]) {
            planCargado[semestre.semestre] = [];
          }
          planCargado[semestre.semestre].push(ramo.codigo);
        }

        if (ramo.status === 'PROYECTADO') {
          inscritosSimulados.add(ramo.codigo);
        }
      });
    });

    setPlanPorCarrera(prev => ({ ...prev, [proyeccion.codigo]: planCargado }));
    setRamosInscritosSimulacion(prev => ({ ...prev, [proyeccion.codigo]: inscritosSimulados }));
  }, [data.carreras]);

  const cancelar = useCallback((codCarrera: string, onCancelarEdicion?: () => void) => {
    setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: {} }));
    setRamosInscritosSimulacion((prev) => ({ ...prev, [codCarrera]: new Set() }));
    setLevantamientos((prev) => ({ ...prev, [codCarrera]: {} }));
    setRamoSinPrereqPorSemestre((prev) => ({ ...prev, [codCarrera]: {} }));
    setEditandoCarrera(null);
    setProyeccionId(null);
    onCancelarEdicion?.();
  }, []);

  const toggleLevantamiento = useCallback((codCarrera: string, nivel: number, tipo: LevantamientoTipo) => {
    setLevantamientos((prev) => {
      const actual = prev[codCarrera]?.[nivel];
      const nuevoValor = actual === tipo ? null : tipo;
      
      return {
        ...prev,
        [codCarrera]: {
          ...(prev[codCarrera] ?? {}),
          [nivel]: nuevoValor,
        },
      };
    });

    // Limpiar ramo sin prereq si se desactiva ese levantamiento
    if (tipo === 'prerequisitos') {
      setRamoSinPrereqPorSemestre((prev) => {
        const nuevos = { ...prev, [codCarrera]: { ...prev[codCarrera] } };
        if (levantamientos[codCarrera]?.[nivel] === 'prerequisitos') {
          delete nuevos[codCarrera][nivel];
        }
        return nuevos;
      });
    }
  }, [levantamientos]);

  const agregarSemestre = useCallback((codCarrera: string, semestresActuales: number) => {
    const maxActual = maxSemestreVisiblePorCarrera[codCarrera] ?? semestresActuales;
    setMaxSemestreVisiblePorCarrera((prev) => ({
      ...prev,
      [codCarrera]: maxActual + 1,
    }));
  }, [maxSemestreVisiblePorCarrera]);

  const simularOptimista = useCallback((codCarrera: string, malla: Asignatura[]) => {
    // Obtener ramos no cursados
    const ramosNoCursados = malla.filter((a) => noCursada(a));
    
    if (ramosNoCursados.length === 0) {
      alert('✅ Todos los ramos ya están cursados');
      return;
    }

    // Separar capstone del resto
    const capstoneRamo = ramosNoCursados.find((a) => 
      a.asignatura.toLowerCase().includes('capston') || a.asignatura.toLowerCase().includes('capstone')
    );
    const ramosRegulares = ramosNoCursados.filter((a) => a.codigo !== capstoneRamo?.codigo);

    // Ordenar ramos por nivel ascendente (más bajos primero)
    const ramosOrdenados = [...ramosRegulares].sort((a, b) => a.nivel - b.nivel);

    const planOptimista: Plan = {};
    const inscritosSimulados = new Set<string>();
    const levantamientosOptimistas: Record<number, LevantamientoTipo> = {};
    const ramoSinPrereqOptimista: Record<number, string> = {};
    const ramosColocados = new Set<string>();

    let semestresNeeded = 1;

    // Algoritmo optimizado por semestre
    while (ramosColocados.size < ramosOrdenados.length) {
      let ramoColocadoEnSemestre = false;
      const ramosDisponibles = ramosOrdenados.filter((r) => !ramosColocados.has(r.codigo));

      if (!planOptimista[semestresNeeded]) {
        planOptimista[semestresNeeded] = [];
      }

      // FASE 1: Rellenar sin levantamientos
      for (const ramo of ramosDisponibles) {
        const ramosEnSemestre = planOptimista[semestresNeeded]
          .map((cod) => malla.find((a) => a.codigo === cod))
          .filter(Boolean) as Asignatura[];

        const creditosActuales = ramosEnSemestre.reduce((sum, r) => sum + r.creditos, 0);
        const cumplePrerequisitos = cumplePrereq(ramo, planOptimista, semestresNeeded, malla, codCarrera);

        // Verificar diferencia de niveles
        const nivelesEnSemestre = ramosEnSemestre.map((r) => r.nivel);
        const nivelesConRamo = [...nivelesEnSemestre, ramo.nivel];
        let hayConflictoDiferencia = false;
        
        for (let i = 0; i < nivelesConRamo.length; i++) {
          for (let j = i + 1; j < nivelesConRamo.length; j++) {
            if (Math.abs(nivelesConRamo[i] - nivelesConRamo[j]) >= 3) {
              hayConflictoDiferencia = true;
              break;
            }
          }
          if (hayConflictoDiferencia) break;
        }

        // Intentar colocar sin levantamientos
        if (creditosActuales + ramo.creditos <= 30 && cumplePrerequisitos && !hayConflictoDiferencia) {
          planOptimista[semestresNeeded].push(ramo.codigo);
          inscritosSimulados.add(ramo.codigo);
          ramosColocados.add(ramo.codigo);
          ramoColocadoEnSemestre = true;
        }
      }

      // FASE 2: Rellenar con levantamientos (solo si hay espacio)
      if (!levantamientosOptimistas[semestresNeeded]) {
        for (const ramo of ramosDisponibles) {
          if (ramosColocados.has(ramo.codigo)) continue;

          const ramosEnSemestre = planOptimista[semestresNeeded]
            .map((cod) => malla.find((a) => a.codigo === cod))
            .filter(Boolean) as Asignatura[];

          const creditosActuales = ramosEnSemestre.reduce((sum, r) => sum + r.creditos, 0);
          const cumplePrerequisitos = cumplePrereq(ramo, planOptimista, semestresNeeded, malla, codCarrera);

          const nivelesEnSemestre = ramosEnSemestre.map((r) => r.nivel);
          const nivelesConRamo = [...nivelesEnSemestre, ramo.nivel];
          let hayConflictoDiferencia = false;
          
          for (let i = 0; i < nivelesConRamo.length; i++) {
            for (let j = i + 1; j < nivelesConRamo.length; j++) {
              if (Math.abs(nivelesConRamo[i] - nivelesConRamo[j]) >= 3) {
                hayConflictoDiferencia = true;
                break;
              }
            }
            if (hayConflictoDiferencia) break;
          }

          // Intentar con levantamiento de créditos
          if (creditosActuales + ramo.creditos <= 35 && cumplePrerequisitos && !hayConflictoDiferencia) {
            planOptimista[semestresNeeded].push(ramo.codigo);
            inscritosSimulados.add(ramo.codigo);
            ramosColocados.add(ramo.codigo);
            levantamientosOptimistas[semestresNeeded] = 'creditos';
            ramoColocadoEnSemestre = true;
          }
          // Intentar con levantamiento de prerequisitos
          else if (!cumplePrerequisitos && creditosActuales + ramo.creditos <= 30 && !hayConflictoDiferencia) {
            planOptimista[semestresNeeded].push(ramo.codigo);
            inscritosSimulados.add(ramo.codigo);
            ramosColocados.add(ramo.codigo);
            levantamientosOptimistas[semestresNeeded] = 'prerequisitos';
            ramoSinPrereqOptimista[semestresNeeded] = ramo.codigo;
            ramoColocadoEnSemestre = true;
          }
          // Intentar con levantamiento de dispersión
          else if (hayConflictoDiferencia && creditosActuales + ramo.creditos <= 30 && cumplePrerequisitos) {
            planOptimista[semestresNeeded].push(ramo.codigo);
            inscritosSimulados.add(ramo.codigo);
            ramosColocados.add(ramo.codigo);
            levantamientosOptimistas[semestresNeeded] = 'dispersion';
            ramoColocadoEnSemestre = true;
          }
        }
      }

      // Si no se colocó ningún ramo en este semestre, pasar al siguiente
      if (!ramoColocadoEnSemestre) {
        semestresNeeded++;
      }
    }

    // Agregar capstone en el último semestre si existe
    let totalSemestres = semestresNeeded;
    if (capstoneRamo) {
      totalSemestres = semestresNeeded + 1;
      planOptimista[totalSemestres] = [capstoneRamo.codigo];
      inscritosSimulados.add(capstoneRamo.codigo);
    }

    // Aplicar el plan optimista
    setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: planOptimista }));
    setRamosInscritosSimulacion((prev) => ({ ...prev, [codCarrera]: inscritosSimulados }));
    setLevantamientos((prev) => ({ 
      ...prev, 
      [codCarrera]: { ...(prev[codCarrera] ?? {}), ...levantamientosOptimistas } 
    }));
    setRamoSinPrereqPorSemestre((prev) => ({ 
      ...prev, 
      [codCarrera]: { ...(prev[codCarrera] ?? {}), ...ramoSinPrereqOptimista } 
    }));
    setMaxSemestreVisiblePorCarrera((prev) => ({ 
      ...prev, 
      [codCarrera]: totalSemestres
    }));

    alert(`✅ Simulación optimista completada!\n\nSemestres necesarios: ${totalSemestres}\nRamos colocados: ${ramosOrdenados.length}${capstoneRamo ? '\nCapstone en semestre ' + totalSemestres : ''}`);
  }, [noCursada, cumplePrereq]);

  const guardarProyeccion = useCallback(async (
    codCarrera: string,
    planCompleto: Record<number, any[]>,
    inscritosSimulados: Set<string>
  ) => {
    const carrera = data.carreras.find((c: any) => c.codigo === codCarrera);
    if (!carrera) throw new Error('Carrera no encontrada');

    const payload = {
      rut: data.rut,
      codigo: carrera.codigo,
      carrera: carrera.carrera,
      plan: Object.fromEntries(
        Object.entries(planCompleto)
          .filter(([_, asigs]: [string, any]) => asigs.length > 0)
          .map(([nivel, asigs]: [string, any]) => [
            nivel,
            asigs.map((asig: any) => {
              let status = asig.status ?? 'NO CURSADO';
              if (inscritosSimulados.has(asig.codigo) && status === 'NO CURSADO') {
                status = 'PROYECTADO';
              }
              
              return {
                codigo: asig.codigo,
                asignatura: asig.asignatura,
                creditos: asig.creditos,
                nivel: asig.nivel,
                prereq: asig.prereq,
                intento: asig.intento ?? 0,
                status: status,
                cursada: status === 'INSCRITO' || status === 'APROBADO',
              };
            }),
          ])
      ),
    };

    return proyeccionId
      ? await proyeccionService.actualizar(proyeccionId, payload)
      : await proyeccionService.guardar(payload);
  }, [data.carreras, data.rut, proyeccionId]);

  return {
    planPorCarrera,
    editandoCarrera,
    draggingRamo,
    hoveredAsignatura,
    ramosInscritosSimulacion,
    proyeccionId,
    levantamientos,
    maxSemestreVisiblePorCarrera,
    setEditandoCarrera,
    setDraggingRamo,
    setHoveredAsignatura,
    setPlanPorCarrera,
    setRamosInscritosSimulacion,
    setProyeccionId,
    noCursada,
    parsePrereq,
    obtenerNivelActualRamo,
    calcularCreditosSemestre,
    cumplePrereq,
    obtenerNombresPrereq,
    agruparMallaPorSemestre,
    moverRamo,
    toggleInscripcionSimulada,
    cargarProyeccionParaEditar,
    cancelar,
    guardarProyeccion,
    obtenerLimiteCreditos,
    tieneDispersinLevantada,
    tienePrerequisitosLevantados,
    toggleLevantamiento,
    agregarSemestre,
    simularOptimista,
  };
};
