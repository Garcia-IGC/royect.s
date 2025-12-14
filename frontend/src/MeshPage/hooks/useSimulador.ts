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

export const useSimulador = (data: any) => {
  const [planPorCarrera, setPlanPorCarrera] = useState<Record<string, Plan>>({});
  const [editandoCarrera, setEditandoCarrera] = useState<string | null>(null);
  const [draggingRamo, setDraggingRamo] = useState<string | null>(null);
  const [hoveredAsignatura, setHoveredAsignatura] = useState<string | null>(null);
  const [ramosInscritosSimulacion, setRamosInscritosSimulacion] = useState<Record<string, Set<string>>>({});
  const [proyeccionId, setProyeccionId] = useState<number | null>(null);

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
    if (inscritosSimulados.has(codigoReq)) return true;

    for (const [nivStr, cods] of Object.entries(plan)) {
      if (Number(nivStr) < nivelDestino && (cods ?? []).includes(codigoReq)) return true;
    }
    return false;
  }, [ramosInscritosSimulacion]);

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

    planTemp[nivelDestino] = [...(planTemp[nivelDestino] ?? []), codigo];

    if (!cumplePrereq(asig, planTemp, nivelDestino, malla, codCarrera)) {
      alert(`❌ No se puede mover "${asig.asignatura}" al semestre ${nivelDestino}.\nNo cumple con los prerequisitos necesarios.`);
      return;
    }

    setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: planTemp }));
  }, [planPorCarrera, ramosInscritosSimulacion, noCursada, obtenerNivelActualRamo, calcularCreditosSemestre, cumplePrereq]);

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
      return;
    }
    
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
    
    setRamosInscritosSimulacion((prev) => {
      const nuevosInscritos = new Set(prev[codCarrera] ?? new Set());
      nuevosInscritos.add(codigo);
      return { ...prev, [codCarrera]: nuevosInscritos };
    });
  }, [ramosInscritosSimulacion, planPorCarrera, obtenerNivelActualRamo, calcularCreditosSemestre]);

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
    setEditandoCarrera(null);
    setProyeccionId(null);
    onCancelarEdicion?.();
  }, []);

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
  };
};
