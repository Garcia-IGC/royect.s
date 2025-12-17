import { Asignatura } from './types';

export function agruparPorSemestre(malla: Asignatura[]) {
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

export function obtenerNombresPrereq(codigosPrereq: string, malla: Asignatura[]): string {
  if (!codigosPrereq) return '';
  const codigos = codigosPrereq.split(',').map((c) => c.trim());
  const nombres = codigos
    .map((codigo) => {
      const asignatura = malla.find((a) => a.codigo === codigo);
      return asignatura ? asignatura.asignatura : null;
    })
    .filter((nombre) => nombre !== null) as string[];
  return nombres.join(', ');
}