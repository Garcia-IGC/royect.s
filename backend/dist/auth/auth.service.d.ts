import { HttpService } from '@nestjs/axios';
export interface LoginResponse {
    rut?: string;
    carreras?: {
        codigo: string;
        nombre: string;
        catalogo: string;
    }[];
    error?: string;
}
export declare class AuthService {
    private httpService;
    constructor(httpService: HttpService);
    login(email: string, pass: string): Promise<LoginResponse>;
}
