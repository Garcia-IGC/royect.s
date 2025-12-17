import React from 'react';

interface CarrerHeaderProps {
  carrera: { codigo: string; carrera: string; catalogo: string; malla?: any[] };
  enEdicion: boolean;
  totalCambios: number;
  totalInscritosSimulados: number;
  proyeccionId: number | null;
  onStartPlanning: () => void;
  onSimulate: () => void;
  onCancel: () => void;
  onSave: () => void;
  onSimularOptimista?: () => void;
}

const CarrerHeader: React.FC<CarrerHeaderProps> = ({
  carrera,
  enEdicion,
  totalCambios,
  totalInscritosSimulados,
  proyeccionId,
  onStartPlanning,
  onSimulate,
  onCancel,
  onSave,
  onSimularOptimista,
}) => {
  const totalModificaciones = totalCambios + totalInscritosSimulados;

  return (
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
            onClick={onStartPlanning}
            className="text-sm px-4 py-2 rounded-lg bg-white text-indigo-700 font-semibold hover:bg-indigo-50 shadow-md transition"
          >
            ✏️ Comenzar Planificación
          </button>
        ) : (
          <>
            {onSimularOptimista && (
              <button
                onClick={onSimularOptimista}
                className="text-sm px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-md transition"
              >
                🚀 Optimista
              </button>
            )}
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
              onClick={onSimulate}
              className="text-sm px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 shadow-md transition"
              disabled={totalModificaciones === 0}
            >
              🎓 Simular Inscripción
            </button>
            <button
              onClick={onCancel}
              className="text-sm px-3 py-2 rounded-lg bg-white/20 text-white border border-white/30 hover:bg-white/30 transition"
            >
              ✕ Cancelar
            </button>
            <button
              onClick={onSave}
              className="text-sm px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow-md transition"
            >
              {proyeccionId ? '💾 Actualizar Proyección' : '💾 Guardar Proyección'}
            </button>
          </>
        )}
      </div>
    </div>

  );
};

export default CarrerHeader;
