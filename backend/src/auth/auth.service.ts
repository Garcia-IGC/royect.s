import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface LoginResponse {
    rut?: string;
    carreras?: {
        codigo: string;
        nombre: string;
        catalogo: string;
    }[];
    error?: string;
}

@Injectable()
export class AuthService {
  constructor(private httpService: HttpService) {}

  async login(email: string, pass: string): Promise<LoginResponse> {
        try {
            
            const response = await firstValueFrom(
                this.httpService.get(`https://puclaro.ucn.cl/eross/avance/login.php`, {
                    params: {
                        email,
                        password: pass
                    }
                })
            );
            return respon   se.data;
        } catch (error) {


            return { error: 'Credenciales incorrectas' };
        }
    }
}
