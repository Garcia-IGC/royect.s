import React, { useEffect, useState } from 'react';
import axios from 'axios';


export interface AuthDataDto {
  rut: string;
  carreras: CarreraDto[];
}

export interface CarreraDto {
    codigo: string;
    carrera: string;
    catalogo: string;
    malla: Asignatura[];
}

export interface Asignatura {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
}

interface MallaProps {
  userData: { rut: string; carreras: any[] } | null;
}

const Malla: React.FC<MallaProps> = ({ userData }) => {

    const [data, setData] = useState<AuthDataDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        if (!userData) return;
        
        const payload = {
          rut: userData.rut,
          carreras: userData.carreras.map(c => ({
          codigo: c.codigo,
          nombre: c.nombre,
          catalogo: c.catalogo
        }))
      };
        const fetchMallas = async () => {
            try{

                const response = await axios.post<AuthDataDto>('http://localhost:3000/malla/obtener-mallas',payload);
                
                setData(response.data);
                setLoading(false);
            }catch (err) {
                setError('Error al obtener las mallas');
                setLoading(false);
                console.error(err);
            }
        };
        fetchMallas();
    }, []);
    
    if (loading) return <p>Cargando mallas...</p>;
    if (error) return <p>{error}</p>;
    if (!data) return <p>No hay datos</p>;
    
function agruparPorSemestre(malla: Asignatura[]) {
  const semestres: Record<number, Asignatura[]> = {};

  malla.forEach((asig) => {
    if (!semestres[asig.nivel]) {
      semestres[asig.nivel] = [];
    }
    semestres[asig.nivel].push(asig);
  });

  // Devolver un array de objetos ordenado por semestre
  return Object.keys(semestres)
    .map(Number)
    .sort((a, b) => a - b)
    .map((nivel) => ({
      nivel,
      asignaturas: semestres[nivel],
    }));
}
    return (
        <div className="malla-container">
            {/* Título Principal: Muestra el nombre de la persona o el RUT */}
            <h1 className="titulo-persona">{data.rut || data.rut}</h1>

            {data.carreras.map((carrera, idx) => {
                const semestresAgrupados = agruparPorSemestre(carrera.malla);

                return (
                    <div key={idx} className="carrera-card">
                        <h2 className="carrera-header">
                            {carrera.carrera} ({carrera.codigo}-{carrera.catalogo})
                        </h2>
                        <div className="semestre-grid" style={{
                            "--num-semestres": semestresAgrupados.length
                        } as React.CSSProperties}> 
                            
                            {semestresAgrupados.map(({ nivel, asignaturas }) => (
                                <div key={nivel} className="semestre-column">
                                    <h3 className="semestre-title">Semestre {nivel}</h3>
                                    <div className="asignatura-list">
                                        {asignaturas.map((asig, i) => (
                                            <div key={i} className="asignatura-item">
                                                <div className="asignatura-code">{asig.codigo} ({asig.creditos} C.)</div>
                                                <div className="asignatura-name">{asig.asignatura}</div>
                                                {asig.prereq && <div className="asignatura-prereq">Req: {asig.prereq}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Malla;