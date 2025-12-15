export type ViewType = 'avance' | 'cursados' | 'proyeccion' | 'simulador' | 'guardadas' | 'optimizada';

export const NAVIGATION_ITEMS: Array<{ id: ViewType; label: string }> = [
  { id: 'avance', label: 'Avance curricular' },
  { id: 'cursados', label: 'Cursos cursados' },
  { id: 'proyeccion', label: 'Proyección' },
  { id: 'simulador', label: 'Simulador de avance' },
  { id: 'guardadas', label: '📚 Proyecciones Guardadas' },
  { id: 'optimizada', label: '✨ Proyección Optimizada' },
];
