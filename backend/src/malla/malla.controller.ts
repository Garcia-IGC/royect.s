import { Controller, Post, Body } from '@nestjs/common';
import { AuthDataDto } from './dto/auth-data.dto';
import { MallaService } from './malla.service';

@Controller('malla')
export class MallaController {
  constructor(private readonly mallaService: MallaService) {}

  @Post('obtener-mallas')
  async obtenerMallas(@Body() datosAuth: AuthDataDto) {
    return await this.mallaService.obtenerMallas(datosAuth);
  }
}
