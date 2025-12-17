import React from 'react';

type LevantamientoTipo = 'creditos' | 'dispersion' | 'prerequisitos' | null;

interface SemesterCardProps {
  nivel: number;
  totalAsignaturas: number;
  creditosSemestre: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  children: React.ReactNode;
  isEditing?: boolean;
  codCarrera?: string;
  levantamientoActual?: LevantamientoTipo;
  onToggleLevantamiento?: (tipo: LevantamientoTipo) => void;
  limiteCreditos?: number;
}

const SemesterCard: React.FC<SemesterCardProps> = ({
  nivel,
  totalAsignaturas,
  creditosSemestre,
  onDragOver,
  onDrop,
  children,
  isEditing = false,
  levantamientoActual = null,
  onToggleLevantamiento,
  limiteCreditos = 30,
}) => {
  const creditosExcedidos = creditosSemestre > limiteCreditos;
  const creditosCasi = creditosSemestre >= limiteCreditos - 5 && creditosSemestre <= limiteCreditos;

  const opcionesLevantamiento = [
    { tipo: 'creditos' as const, label: 'Créditos (30→35)', icon: '💰' },
    { tipo: 'dispersion' as const, label: 'Dispersión', icon: '📚' },
    { tipo: 'prerequisitos' as const, label: 'Prerequisitos', icon: '🔓' },
  ];

  return (
    <div
      className="flex-shrink-0 w-64"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className={`rounded-lg p-3 mb-3 shadow-md ${
          creditosExcedidos
            ? 'bg-gradient-to-r from-red-500 to-red-600'
            : creditosCasi
            ? 'bg-gradient-to-r from-orange-500 to-amber-500'
            : 'bg-gradient-to-r from-cyan-500 to-teal-400'
        }`}
      >
        <h3 className="text-sm font-bold text-white text-center">
          📅 Semestre {nivel}
        </h3>
        <p className="text-xs text-center text-white/80 mt-0.5">
          {totalAsignaturas} asignaturas
        </p>
        <div
          className={`text-xs font-bold text-center mt-1 px-2 py-1 rounded ${
            creditosExcedidos
              ? 'bg-red-900/30 text-white'
              : creditosCasi
              ? 'bg-orange-900/30 text-white'
              : 'bg-white/20 text-white'
          }`}
        >
          {creditosSemestre} / {limiteCreditos} SCT
          {creditosExcedidos && ' ⚠️'}
        </div>
      </div>

      {/* Selector de levantamiento */}
      {isEditing && onToggleLevantamiento && (
        <div className="mb-3 p-2 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2 text-center">
            🎯 Levantamiento (1 máx)
          </p>
          <div className="grid grid-cols-3 gap-1">
            {opcionesLevantamiento.map(({ tipo, label, icon }) => (
              <button
                key={tipo}
                onClick={() => onToggleLevantamiento(levantamientoActual === tipo ? null : tipo)}
                className={`text-xs py-1 px-1 rounded font-semibold transition-all ${
                  levantamientoActual === tipo
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-400'
                }`}
                title={label}
              >
                {icon}
                <div className="text-xs">{label.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Zona de drop */}
      <div className="min-h-[100px] space-y-2 p-2 rounded-lg border-2 border-transparent bg-transparent">
        {children}
      </div>
    </div>
  );
};

export default SemesterCard;
