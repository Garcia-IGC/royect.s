import { HttpService } from '@nestjs/axios';
import { AuthDataDto, MallaResultado } from './dto/auth-data.dto';
export declare class MallaService {
    private httpService;
    constructor(httpService: HttpService);
    obtenerMallas(datosAuth: AuthDataDto): Promise<MallaResultado[]>;
}
