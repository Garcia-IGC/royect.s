import React, { useState } from 'react';
import axios from 'axios';

interface Props {
  rut: string;
  onGuardar: (proyeccion: any) => void;
}

const OptimizedProjectionView: React.FC<Props> = ({ rut, onGuardar }) => {
  const [generando, setGenerando] = useState(false);
  const [resultado, setResultado] = useState<any[] | null>(null);

  const handleGenerar = () => {
    setGenerando(true);
    // llamada al backend
    setTimeout(() => {
      setResultado([
        
      ]);
      setGenerando(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Proyección Optimizada</h2>
        <p className="text-gray-600 mb-6">
          Genera automáticamente la mejor carga académica basada en tus tiempos, créditos y futuros requisitos.
        </p>

        {!resultado ? (
          <div className="text-center py-10">
            <button
              onClick={handleGenerar}
              disabled={generando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105 disabled:opacity-50"
            >
              {generando ? 'Analizando Malla...' : '✨ Generar Proyección Óptima'}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <h3 className="text-lg font-semibold mb-4 text-indigo-900">Recomendación Generada:</h3>
            <div className="space-y-3 mb-6">
              {resultado.map((ramo, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div>
                    <div className="font-bold text-gray-800">{ramo.nombre}</div>
                    <div className="text-xs text-indigo-600">{ramo.codigo}</div>
                  </div>
                  <div className="text-sm text-gray-500 italic">{ramo.motivo}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setResultado(null)} className="text-gray-500 hover:text-gray-700 px-4 py-2">
                Descartar
              </button>
              <button 
                onClick={() => onGuardar(resultado)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg shadow"
              >
                Guardar Proyección
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OptimizedProjectionView;