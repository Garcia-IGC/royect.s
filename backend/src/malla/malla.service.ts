import { Headers, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthDataDto, MallaResultado } from './dto/auth-data.dto';
import { firstValueFrom } from 'rxjs';

export interface ResultadoFinal {
  rut: string;
  carreras: MallaResultado[];
}

export interface AvanceCarrera {
  carrera: string;
  codigo: string;
  avances: any[];
  error?: boolean;
}


@Injectable()
export class MallaService {
    constructor(private httpService: HttpService) {}

    

    async obtenerMallas(datosAuth: AuthDataDto) {

        console.log('obteniendo mallas')
        

        const resultadoFinal: ResultadoFinal = {
            rut: datosAuth.rut,
            carreras: []
            };

        for (const carrera of datosAuth.carreras) {
            const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${carrera.codigo}-${carrera.catalogo}`;

            try {
                const response = await firstValueFrom(
                this.httpService.get(url, { headers: { 'X-HAWAII-AUTH': 'jf400fejof13f' }})
                );
                
                resultadoFinal.carreras.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: response.data,   
                });

            } catch (error) {
                console.error(`Error al obtener malla de ${carrera.codigo}-${carrera.catalogo}`, error.message);
                resultadoFinal.carreras.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: [],
                    error: true
                });
            }
            }
            
        return resultadoFinal;

    }
    async obtenerAvance(resultadoFinal: ResultadoFinal): Promise<AvanceCarrera[]> {
        const avances: AvanceCarrera[] = [];

        console.log('obteniendo avances')

        for (const carrera of resultadoFinal.carreras) {
            const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${resultadoFinal.rut}&codcarrera=${carrera.codigo}`;
            


            try {
                const response = await firstValueFrom(
                    this.httpService.get(url, { 
                        headers: { 'X-HAWAII-AUTH': 'jf400fejof13f' } 
                    })
                );
                
                avances.push({
                    carrera: carrera.carrera,
                    codigo: carrera.codigo,
                    avances: response.data
                });

                
                


            } catch (error) {
                console.error(`Error al obtener avance de ${carrera.codigo}`, error.message);
                avances.push({
                    carrera: carrera.carrera,
                    codigo: carrera.codigo,
                    avances: [],
                    error: true
                });
            }
        }
        
        return avances;
    }

    async combinarMallaYAvance(resultadoFinal: ResultadoFinal): Promise<ResultadoFinal> {

    //Obtener los avances
    const avances = await this.obtenerAvance(resultadoFinal);



    // Recorre cada carrera dentro de resultadoFinal
    for (const carrera of resultadoFinal.carreras) {
        // Busca el avance correspondiente a esta carrera
        const avanceCarrera = avances.find(a => a.codigo === carrera.codigo);


        if (!avanceCarrera || avanceCarrera.error) {
        // Si no hay datos de la carrera en el avance, marca todos los ramos como no cursados
            carrera.malla = carrera.malla.map(ramo => ({
                ...ramo,
                status: 'NO CURSADO',
                cursada: false,
                intento:0
            }));
            continue;
        }

        // Si hay avance se combina
        carrera.malla = carrera.malla.map(ramo => {
        // Buscar *todos* los avances correspondientes al ramo
        const resultadosRamo = avanceCarrera.avances.filter(a => a.course === ramo.codigo);

        // Inicializar intento del ramo si no existe
        if (ramo.intento == null) {
            ramo.intento = 0;
        }

        // Si el ramo aparece más de una vez en el avance,
        // contamos cuántas veces fue APROBADO o REPROBADO
        let intentos = 0;
        let statusFinal = 'NO CURSADO';

        if (resultadosRamo.length > 0) {
            for (const resultado of resultadosRamo) {
                if (resultado.status === 'APROBADO' || resultado.status === 'REPROBADO') {
                    intentos += 1;
                }

                // Nos quedamos con el último estado conocido (puedes ajustarlo según tu lógica)
                statusFinal = resultado.status;
            }
        }

        // Actualizar intento total
        ramo.intento = intentos;

        return {
            ...ramo,
            status: statusFinal,
            cursada: resultadosRamo.length > 0,
        };
    });

    }

    return resultadoFinal;
}

}
