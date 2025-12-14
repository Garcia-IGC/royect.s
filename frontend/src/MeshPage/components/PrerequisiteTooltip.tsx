import React from 'react';

interface PrerequisiteTooltipProps {
  prerequisitos: string;
  cumple: boolean;
  noCursada: boolean;
}

const PrerequisiteTooltip: React.FC<PrerequisiteTooltipProps> = ({
  prerequisitos,
  cumple,
  noCursada,
}) => {
  if (!prerequisitos) return null;

  return (
    <div className="absolute left-full ml-2 top-0 z-[999] w-64 bg-white border-2 border-teal-400 rounded-lg shadow-2xl p-3">
      <div className="text-xs font-bold text-teal-700 mb-2 border-b border-teal-200 pb-1">
        📋 Prerequisitos:
      </div>
      <div className="text-[11px] text-gray-700 leading-relaxed">
        {prerequisitos}
      </div>
      {!cumple && noCursada && (
        <div className="mt-2 text-[11px] text-red-600 font-semibold">
          ⚠️ No cumple prerequisitos en este semestre
        </div>
      )}
    </div>
  );
};

export default PrerequisiteTooltip;
