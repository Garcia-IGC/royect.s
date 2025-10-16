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
}
