import React from 'react';

interface SemesterCardProps {
  nivel: number;
  totalAsignaturas: number;
  creditosSemestre: number;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  children: React.ReactNode;
}

const SemesterCard: React.FC<SemesterCardProps> = ({
  nivel,
  totalAsignaturas,
  creditosSemestre,
  onDragOver,
  onDrop,
  children,
}) => {
  const creditosExcedidos = creditosSemestre > 30;
  const creditosCasi = creditosSemestre >= 25 && creditosSemestre <= 30;

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
          {creditosSemestre} / 30 SCT
          {creditosExcedidos && ' ⚠️'}
        </div>
      </div>

      {/* Zona de drop */}
      <div className="min-h-[100px] space-y-2 p-2 rounded-lg border-2 border-transparent bg-transparent">
        {children}
      </div>
    </div>
  );
};

export default SemesterCard;
