import React from 'react';

type Asignatura = {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  status: string;
  intento: number;
};

interface AsignatureCardProps {
  asig: Asignatura;
  nivel: number;
  isEditing: boolean;
  isMovable: boolean;
  isSimulated: boolean;
  isMoved: boolean;
  cumplePrereq: boolean;
  prereqNoSatisfechos?: string;
  onDragStart: () => void;
  onSimulateInscription: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  hoveredAsignatura: string | null;
  ramoId: string;
  children?: React.ReactNode;
}

const AsignatureCard: React.FC<AsignatureCardProps> = ({
  asig,
  nivel,
  isEditing,
  isMovable,
  isSimulated,
  isMoved,
  cumplePrereq,
  prereqNoSatisfechos = '',
  onDragStart,
  onSimulateInscription,
  onMouseEnter,
  onMouseLeave,
  hoveredAsignatura,
  ramoId,
  children,
}) => {
  // ...existing color logic...
  let bgColor, borderColor, codigoBadge;
  if (asig.status === 'APROBADO') {
    bgColor = 'bg-gradient-to-br from-green-50 to-emerald-50';
    borderColor = 'border-emerald-500';
    codigoBadge = 'bg-emerald-100 text-emerald-700';
  } else if (asig.status === 'INSCRITO') {
    bgColor = 'bg-gradient-to-br from-blue-50 to-sky-50';
    borderColor = 'border-sky-500';
    codigoBadge = 'bg-sky-100 text-sky-700';
  } else if (isSimulated) {
    bgColor = 'bg-gradient-to-br from-purple-50 to-violet-50';
    borderColor = 'border-purple-500';
    codigoBadge = 'bg-purple-100 text-purple-700';
  } else if (cumplePrereq) {
    bgColor = 'bg-gradient-to-br from-teal-50 to-cyan-50';
    borderColor = 'border-teal-400';
    codigoBadge = 'bg-teal-100 text-teal-700';
  } else {
    bgColor = 'bg-gradient-to-br from-orange-50 to-red-50';
    borderColor = 'border-orange-400';
    codigoBadge = 'bg-orange-100 text-orange-700';
  }

  const noCursada = asig.status !== 'APROBADO' && asig.status !== 'INSCRITO';

  return (
    <div
      draggable={isMovable}
      onDragStart={onDragStart}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative z-10 rounded-lg p-3 shadow-md hover:shadow-lg hover:z-20 transition-all duration-200 ${bgColor} border-l-4 ${borderColor} ${
        isMovable ? 'cursor-move hover:scale-[1.02]' : 'cursor-default'
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

      {noCursada && isEditing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSimulateInscription();
          }}
          className={`w-full text-[10px] font-bold px-2 py-1 rounded mt-2 transition ${
            isSimulated
              ? 'bg-purple-500 text-white hover:bg-purple-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          title={
            isSimulated
              ? 'Click para desmarcar como inscrito'
              : 'Click para simular inscripción'
          }
        >
          {isSimulated ? '✓ Inscrito (simulado)' : '○ Simular inscripción'}
        </button>
      )}

      <div className="flex items-center gap-1 flex-wrap mt-2">
        {isMoved && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500 text-white">
            📍 Movido (S{asig.nivel}→S{nivel})
          </span>
        )}
        {!cumplePrereq && noCursada && (
          <div className="w-full">
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white block">
              ⚠️ Sin prereq
            </span>
            {prereqNoSatisfechos && (
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 block mt-1 leading-tight">
                Falta: {prereqNoSatisfechos}
              </span>
            )}
          </div>
        )}
        {asig.intento > 0 && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
            {asig.intento}° intento
          </span>
        )}
        {isMovable && (
          <span className="text-[9px] text-gray-500">🔄 Arrastrable</span>
        )}
      </div>

      {children}
    </div>
  );
};

export default AsignatureCard;
