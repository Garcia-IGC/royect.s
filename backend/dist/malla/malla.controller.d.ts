import { AuthDataDto } from './dto/auth-data.dto';
import { MallaService } from './malla.service';
export declare class MallaController {
    private readonly mallaService;
    constructor(mallaService: MallaService);
    obtenerMallas(datosAuth: AuthDataDto): Promise<import("./malla.service").ResultadoFinal>;
    obtenerAvances(datosAuth: AuthDataDto): Promise<import("./malla.service").AvanceCarrera[]>;
    obtenerMallaYAvance(datosAuth: AuthDataDto): Promise<import("./malla.service").ResultadoFinal>;
}
