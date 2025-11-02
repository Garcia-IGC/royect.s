import { Controller, Post, Body } from '@nestjs/common';
import { ProyeccionService } from './proyeccion.service';

@Controller('proyeccion')
export class ProyeccionController {
  constructor(private readonly proyeccionService: ProyeccionService) {}

  @Post('guardar')
  async guardar(@Body() data: any) {
    console.log('📩 POST /proyeccion/guardar recibido');
    return this.proyeccionService.guardarProyeccion(data);
  }
}
