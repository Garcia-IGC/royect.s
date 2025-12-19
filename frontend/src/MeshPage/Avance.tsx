import React, { useState } from 'react';
import { CarreraDto } from './types';
import { agruparPorSemestre, obtenerNombresPrereq } from './mallaUtils';

type Props = { carreras: CarreraDto[] };

const Avance: React.FC<Props> = ({ carreras }) => {
  const [hoveredAsignatura, setHoveredAsignatura] = useState<string | null>(null);

  return (
    <>
      {carreras.map((carrera, idx) => {
        const semestresAgrupados = agruparPorSemestre(carrera.malla);
        return (
          <div key={idx} className="mb-8">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-t-xl p-3 shadow-lg">
              <h2 className="text-xl font-bold text-white">{carrera.carrera}</h2>
              <p className="text-indigo-100 text-xs mt-0.5">
                Código: {carrera.codigo} | Catálogo: {carrera.catalogo}
              </p>
            </div>

            <div className="bg-white rounded-b-xl shadow-lg p-3 overflow-x-auto overflow-y-visible relative isolate">
              <div className="flex gap-2 min-w-max">
                {semestresAgrupados.map(({ nivel, asignaturas }) => (
                  <div key={nivel} className="flex-shrink-0 w-48">
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-400 rounded-lg p-2 mb-2">
                      <h3 className="text-sm font-semibold text-white text-center">
                        Semestre {nivel}
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {asignaturas.map((asig, i) => {
                        const asignaturaId = `${idx}-${nivel}-${i}`;
                        const nombresPrereq = obtenerNombresPrereq(asig.prereq, carrera.malla);

                        return (
                          <div
                            key={i}
                            className="relative z-10 bg-gradient-to-br from-teal-50 to-cyan-50 border-l-4 border-teal-400 rounded-lg p-2.5 shadow-md hover:shadow-lg hover:z-20 transition-all duration-200 hover:scale-105 cursor-pointer"
                            onMouseEnter={() => setHoveredAsignatura(asignaturaId)}
                            onMouseLeave={() => setHoveredAsignatura(null)}
                          >
                            <div className="flex items-start justify-between mb-1.5">
                              <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                                {asig.codigo}
                              </span>
                              <span className="text-[10px] font-semibold text-gray-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                                {asig.creditos} SCT
                              </span>
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  asig.status === 'APROBADO' || asig.status === 'INSCRITO'
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-red-100 text-red-700 border border-red-300'
                                }`}
                              >
                                {asig.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-semibold text-gray-800 leading-tight">
                                {asig.asignatura}
                              </h4>
                              {asig.intento > 0 && (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 border border-yellow-300">
                                  {asig.intento}° intento
                                </span>
                              )}
                            </div>

                            {asig.prereq && hoveredAsignatura === asignaturaId && (
                              <div className="absolute left-full ml-2 top-0 z-[999] w-64 bg-white border-2 border-teal-400 rounded-lg shadow-2xl p-3">
                                <div className="text-xs font-bold text-teal-700 mb-2 border-b border-teal-200 pb-1">
                                  📋 Prerequisitos:
                                </div>
                                <div className="text-[11px] text-gray-700 leading-relaxed">
                                  {nombresPrereq}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Avance;