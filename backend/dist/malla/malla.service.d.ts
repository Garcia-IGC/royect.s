import { HttpService } from '@nestjs/axios';
import { AuthDataDto, MallaResultado } from './dto/auth-data.dto';
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
export declare class MallaService {
    private httpService;
    constructor(httpService: HttpService);
    obtenerMallas(datosAuth: AuthDataDto): Promise<ResultadoFinal>;
    obtenerAvance(resultadoFinal: ResultadoFinal): Promise<AvanceCarrera[]>;
}
