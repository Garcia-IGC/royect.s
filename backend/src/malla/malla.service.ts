import { Headers, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthDataDto, MallaResultado } from './dto/auth-data.dto';
import { firstValueFrom } from 'rxjs';


@Injectable()
export class MallaService {
    constructor(private httpService: HttpService) {}

    async obtenerMallas(datosAuth: AuthDataDto) {

        const resultados: MallaResultado[] = [];

        for (const carrera of datosAuth.carreras) {
            const url = `https://losvilos.ucn.cl/hawaii/api/mallas?${carrera.codigo}-${carrera.catalogo}`;

            try {
                const response = await firstValueFrom(
                this.httpService.get(url, { headers: { 'X-HAWAII-AUTH': 'jf400fejof13f' }})
                );
                
                resultados.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: response.data,   
                });

            } catch (error) {
                console.error(`Error al obtener malla de ${carrera.codigo}-${carrera.catalogo}`, error.message);
                resultados.push({
                    carrera: carrera.nombre,
                    codigo: carrera.codigo,
                    catalogo: carrera.catalogo,
                    malla: [],
                    error: true
                });
            }
            }
        return resultados;

    }
}