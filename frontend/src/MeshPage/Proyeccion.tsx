import React from 'react';
import type { CarreraDto } from './types';

type Props = { carreras: CarreraDto[] };

const Proyeccion: React.FC<Props> = ({ carreras }) => {
  return (
    <>
      {carreras.map((carrera, idx) => {
        const pendientes = carrera.malla.filter(
          (a) => a.status !== 'APROBADO' && a.status !== 'INSCRITO'
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
              {pendientes.length === 0 ? (
                <p className="text-sm text-gray-600">No quedan cursos por cursar.</p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                  {pendientes.map((asig, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-rose-50 to-red-50 border-l-4 border-rose-400 rounded-lg p-2.5 shadow-sm"
                    >
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                          {asig.codigo}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                          {asig.creditos} SCT
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                          NO CURSADO
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

export default Proyeccion;