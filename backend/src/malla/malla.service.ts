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
                cursada: false
            }));
            continue;
        }

        // Si hay avance se combina
        carrera.malla = carrera.malla.map(ramo => {
        // Buscando el ramo en el avance
        const resultadoRamo = avanceCarrera.avances.find(a => a.course === ramo.codigo);

        // De momento, si existe es tomado como cursado
        return {
            ...ramo,
            status: resultadoRamo ? 'CURSADO' : 'NO CURSADO',
            cursada: resultadoRamo ? true:false
        };
        });
    }

    return resultadoFinal;
}

}
