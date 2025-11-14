import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ProyeccionService } from './proyeccion.service';

@Controller('proyeccion')
export class ProyeccionController {
  constructor(private readonly proyeccionService: ProyeccionService) {}

  @Post('guardar')
  async guardar(@Body() data: any) {
    return this.proyeccionService.guardarProyeccion(data);
  }

  @Get('obtener/:rut')
  async obtenerPorRut(@Param('rut') rut: string) {
    return this.proyeccionService.obtenerProyeccionesPorRut(rut);
  }

  @Get('detalle/:id')
  async obtenerPorId(@Param('id') id: string) {
    return this.proyeccionService.obtenerProyeccionPorId(parseInt(id));
  }

  @Delete('eliminar/:id')
  async eliminar(@Param('id') id: string) {
    return this.proyeccionService.eliminarProyeccion(parseInt(id));
  }
}
