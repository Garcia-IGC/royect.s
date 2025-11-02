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
  @Post('obtener-avances')
  async obtenerAvances(@Body() datosAuth: AuthDataDto) {

    const resultadoMallas = await this.mallaService.obtenerMallas(datosAuth);
    return await this.mallaService.obtenerAvance(resultadoMallas);
    
  }
  @Post('malla-avance')  
  async obtenerMallaYAvance(@Body() datosAuth: AuthDataDto) {
    const resultadoMalla = await this.mallaService.obtenerMallas(datosAuth);
    const resultadoFinal = await this.mallaService.combinarMallaYAvance(resultadoMalla);
    return resultadoFinal;
  }

  

}
