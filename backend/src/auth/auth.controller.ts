import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { username: string, password: string }) {
    // El frontend envía 'username', pero la API externa espera 'email'. Asumimos que el username es el email.
    return this.authService.login(body.username, body.password);
  }
}
