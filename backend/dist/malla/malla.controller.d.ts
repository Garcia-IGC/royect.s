import { AuthDataDto } from './dto/auth-data.dto';
import { MallaService } from './malla.service';
export declare class MallaController {
    private readonly mallaService;
    constructor(mallaService: MallaService);
    obtenerMallas(datosAuth: AuthDataDto): Promise<import("./dto/auth-data.dto").MallaResultado[]>;
}
