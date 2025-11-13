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

    
    /*
    * obtenerMallas
    * @parametros: datosAuth: AuthDataDto
    * @retorno: retorna como resultado la malla o las malla del alumno correspondiente
    * Esta función  atravez de API-REST obtiene los datos de el end-point de las mallas
    */
    async obtenerMallas(datosAuth: AuthDataDto) {

        console.log('obteniendo mallas')
        

        const resultadoFinal: ResultadoFinal = {
            rut: datosAuth.rut,
            carreras: []
            };

        for (const carrera of datosAuth.carreras) {
            //Endpoint a consultar los datos de malla
            const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${carrera.codigo}-${carrera.catalogo}`;


            //Transacción para la obtencion de los datos
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
            // Error en caso de que la transacción no pueda ser realizada con exito
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

    /*
    * obtenerAvance
    * @parametros: resultadoFinal (malla o mallas de el alumno objetivo)
    * @retorno: retorna todos los avances del alumno correspondiente separandolos por carrera y codigo
    * con su respectivo avance (Aprobados, reprobados, inscripciónes, entre otros utiles datos)
    * Esta función  atravez de API-REST obtiene los datos de el avance de el alumno 
    * con el end-point de avances
    */
    async obtenerAvance(resultadoFinal: ResultadoFinal): Promise<AvanceCarrera[]> {
        const avances: AvanceCarrera[] = [];

        console.log('obteniendo avances')

        
        for (const carrera of resultadoFinal.carreras) {
            //endpoint para los avances
            const url = `https://puclaro.ucn.cl/eross/avance/avance.php?rut=${resultadoFinal.rut}&codcarrera=${carrera.codigo}`;
            

            //transaccion para asegurar el envio de todos o ningun dato
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


    /*
    * combinarMallaYAvance
    * @parametros: resultadoFinal (malla o mallas de el alumno objetivo)
    * @retorno: retorna la malla completa del alumno con sus respectivos avances en cada una de estas
    * (Aprobados, reprobados, inscripciónes, entre otros utiles datos)
    * Esta función  utiliza ambas funciones previamente documentadas, primero para obtener las mallas, luego los avances
    * y finalmente lo que la funcion hace es calificar los ramos que se han dado con su status y la cantidad
    * de veces que estos se han cursado, si el ramo no se encuentra en los avances se marca como  NO CURSADO
    */
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
        // Buscar todos los avances correspondientes al ramo
        const resultadosRamo = avanceCarrera.avances.filter(a => a.course === ramo.codigo);

        // Inicializar intento del ramo si no existe (representa la cantidad de veces que se ha cursado el ramo)
        if (ramo.intento == null) {
            ramo.intento = 0;
        }

        // Si el ramo aparece más de una vez en el avance, se cuenta cuántas veces realizado (aprobado o reprobado)
        let intentos = 0;
        let statusFinal = 'NO CURSADO';

        if (resultadosRamo.length > 0) {
            for (const resultado of resultadosRamo) {
                if (resultado.status === 'APROBADO' || resultado.status === 'REPROBADO') {
                    intentos += 1;
                }

                // El ultimo estatus del ramo es el que corresponde
                statusFinal = resultado.status;
            }
        }

        // Actualizar intento total para proyeccion posterior
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
