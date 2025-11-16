import React from 'react';
import type { CarreraDto } from './types';

type Props = { carreras: CarreraDto[] };

const Cursados: React.FC<Props> = ({ carreras }) => {
  return (
    <>
      {carreras.map((carrera, idx) => {
        const cursados = carrera.malla.filter(
          (a) => a.status === 'APROBADO' || a.status === 'REPROBADO'
        );
        return (
          <div key={idx} className="mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl p-3 shadow-lg">
              <h2 className="text-xl font-bold text-white">{carrera.carrera}</h2>
              <p className="text-indigo-100 text-xs mt-0.5">
                Código: {carrera.codigo} | Catálogo: {carrera.catalogo}
              </p>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg p-3">
              {cursados.length === 0 ? (
                <p className="text-sm text-gray-600">No hay cursos cursados aún.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {cursados.map((asig, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 border-l-4 border-emerald-400 rounded-lg p-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {asig.codigo}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                          {asig.creditos} SCT
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                          CURSADO
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-800 leading-tight">
                        {asig.asignatura}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Cursados;