import React, {useState} from 'react';

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

type Props = {
  data: AuthDataDto;
  onSave?: (plan: Record<string, Record<number, string[]>>) => void; 
};

const SimuladorAvance: React.FC<Props> = ({ data, onSave }) => {
  type Plan = Record<number, string[]>;        // nivel -> [codigos]
  const [planPorCarrera, setPlanPorCarrera] = useState<Record<string, Plan>>({});
  const [editandoCarrera, setEditandoCarrera] = useState<string | null>(null);

  const agruparPorSemestre = (malla: Asignatura[]) => {
    const sem: Record<number, Asignatura[]> = {};
    malla.forEach((a) => {
      (sem[a.nivel] ||= []).push(a);
    });
    return Object.keys(sem)
      .map(Number)
      .sort((a, b) => a - b)
      .map((nivel) => ({ nivel, asignaturas: sem[nivel] }));
  };

  const noCursada = (a: Asignatura) => a.status !== 'APROBADO' && a.status !== 'INSCRITO';

  const parsePrereq = (s: string) =>
    (s || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

  const aprobadaOPlanAnterior = (
    codigoReq: string,
    plan: Plan,
    nivelDestino: number,
    malla: Asignatura[]
  ) => {
    const req = malla.find((a) => a.codigo === codigoReq);
    const yaAprob = req && (req.status === 'APROBADO' || req.status === 'INSCRITO');
    if (yaAprob) return true;

    for (const [nivStr, cods] of Object.entries(plan)) {
      const niv = Number(nivStr);
      if (niv < nivelDestino && (cods ?? []).includes(codigoReq)) return true;
    }
    return false;
  };

  const cumplePrereq = (a: Asignatura, plan: Plan, nivelDestino: number, malla: Asignatura[]) => {
    const reqs = parsePrereq(a.prereq);
    return reqs.every((cod) => aprobadaOPlanAnterior(cod, plan, nivelDestino, malla));
  };

  const addSeleccion = (
    codCarrera: string,
    nivel: number,
    codigo: string,
    malla: Asignatura[]
  ) => {
    if (!codigo) return;
    const planActual = planPorCarrera[codCarrera] ?? {};
    const asig = malla.find((a) => a.codigo === codigo);
    const yaEnPlan = Object.values(planActual).some(arr => (arr ?? []).includes(codigo));
    if (yaEnPlan) return;
    if (!asig) return;
    if (!cumplePrereq(asig, planActual, nivel, malla)) {
      console.warn('No cumple prerrequisitos:', codigo);
      return;
    }
    setPlanPorCarrera((prev) => {
      const plan = prev[codCarrera] ?? {};
      const ya = new Set(plan[nivel] ?? []);
      ya.add(codigo);
      return { ...prev, [codCarrera]: { ...plan, [nivel]: Array.from(ya) } };
    });
  };

  const removeSeleccion = (codCarrera: string, nivel: number, codigo: string) => {
    setPlanPorCarrera((prev) => {
      const plan = prev[codCarrera] ?? {};
      const ya = new Set(plan[nivel] ?? []);
      ya.delete(codigo);
      return { ...prev, [codCarrera]: { ...plan, [nivel]: Array.from(ya) } };
    });
  };

  const cancelar = (codCarrera: string) => {
    setPlanPorCarrera((prev) => ({ ...prev, [codCarrera]: {} }));
    setEditandoCarrera(null);
  };

  const guardar = (codCarrera: string) => {
    const plan = planPorCarrera[codCarrera] ?? {};
    console.log('Simulador (no se persiste):', { rut: data.rut, carrera: codCarrera, plan });
    onSave?.({ [codCarrera]: plan });
    setEditandoCarrera(null);
  };

  const nombreAsignatura = (malla: Asignatura[], codigo: string) =>
    malla.find((a) => a.codigo === codigo)?.asignatura ?? codigo;

  return (
    <div>
      {/* Encabezado */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Simulador de avance</h1>
        <p className="text-sm text-gray-600">RUT: {data.rut}</p>
      </div>

      {data.carreras.map((carrera, idx) => {
        const enEdicion = editandoCarrera === carrera.codigo;
        const planActual = planPorCarrera[carrera.codigo] ?? {};
        const totalSel = Object.values(planActual).reduce((acc, v) => acc + (v?.length ?? 0), 0);
        const semestres = agruparPorSemestre(carrera.malla);

        return (
          <div key={idx} className="mb-8">
            {/* Barra de carrera */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl p-3 shadow-lg flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{carrera.carrera}</h2>
                <p className="text-indigo-100 text-xs mt-0.5">
                  Código: {carrera.codigo} | Catálogo: {carrera.catalogo}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!enEdicion ? (
                  <button
                    onClick={() => setEditandoCarrera(carrera.codigo)}
                    className="text-xs px-3 py-1.5 rounded bg-white/90 text-indigo-700 border border-white hover:bg-white shadow"
                  >
                    Planificar
                  </button>
                ) : (
                  <>
                    <span className="text-[11px] text-indigo-100">Seleccionadas: {totalSel}</span>
                    <button
                      onClick={() => cancelar(carrera.codigo)}
                      className="text-xs px-2 py-1.5 rounded bg-white/20 text-white border border-white/30 hover:bg-white/30"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => guardar(carrera.codigo)}
                      className="text-xs px-2.5 py-1.5 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                    >
                      Guardar
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Secciones por semestre (vacías al inicio) */}
            <div className="bg-white rounded-b-xl shadow-lg p-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {semestres.map(({ nivel, asignaturas }) => {
                  const seleccionadas = planActual[nivel] ?? [];
                  const yaSeleccionadasGlobal = new Set(
                    Object.values(planActual).reduce<string[]>((acc, a) => acc.concat(a ?? []), [])
                  );
                  const opcionesDisponibles = carrera.malla
                    .filter(noCursada)
                    .filter((a) => !yaSeleccionadasGlobal.has(a.codigo))
                    .filter((a) => cumplePrereq(a, planActual, nivel, carrera.malla));

                  return (
                    <div key={nivel} className="flex-shrink-0 w-64">
                      <div className="bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg p-2 mb-2">
                        <h3 className="text-sm font-semibold text-white text-center">Semestre {nivel}</h3>
                      </div>

                      {/* Lista de seleccionadas (chips) */}
                      <div className="space-y-2">
                        {seleccionadas.length === 0 && (
                          <div className="text-[12px] text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded p-2 text-center">
                            Aún sin asignaturas
                          </div>
                        )}

                        {seleccionadas.map((codigo) => (
                          <div
                            key={codigo}
                            className="flex items-center justify-between bg-gradient-to-br from-teal-50 to-cyan-50 border-l-4 border-teal-500 rounded-lg p-2 shadow-sm"
                          >
                            <div className="min-w-0">
                              <div className="text-[10px] font-bold text-teal-700">{codigo}</div>
                              <div className="text-[11px] font-medium text-gray-800 truncate">
                                {nombreAsignatura(carrera.malla, codigo)}
                              </div>
                            </div>
                            {enEdicion && (
                              <button
                                onClick={() => removeSeleccion(carrera.codigo, nivel, codigo)}
                                className="ml-2 text-xs px-2 py-1 rounded bg-rose-100 text-rose-700 hover:bg-rose-200"
                                title="Quitar"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Selector para agregar (solo en edición) */}
                      {enEdicion && (
                        <div className="mt-2">
                          <label className="block text-[11px] text-gray-600 mb-1">Agregar asignatura</label>
                          <select
                            className="w-full text-sm border rounded-lg px-2 py-1.5 bg-white"
                            onChange={(e) => {
                              addSeleccion(carrera.codigo, nivel, e.target.value, carrera.malla);
                              e.currentTarget.selectedIndex = 0; 
                            }}
                          >
                            <option value="">Selecciona…</option>
                            {opcionesDisponibles.map((a) => (
                              <option key={a.codigo} value={a.codigo}>
                                {a.codigo} · {a.asignatura} — S{a.nivel} ({a.creditos} SCT)
                              </option>
                            ))}
                          </select>
                          {opcionesDisponibles.length === 0 && (
                            <p className="mt-1 text-[11px] text-gray-400">No hay más asignaturas disponibles.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SimuladorAvance;