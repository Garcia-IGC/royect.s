import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { ProyeccionService } from './proyeccion.service';

@Controller('proyeccion')
export class ProyeccionController {
  constructor(private readonly proyeccionService: ProyeccionService) {}

  @Post('guardar')
  async guardar(@Body() data: any) {
    console.log('📩 POST /proyeccion/guardar recibido');
    return this.proyeccionService.guardarProyeccion(data);
  }

  @Get('obtener/:rut')
  async obtenerPorRut(@Param('rut') rut: string) {
    console.log('📩 GET /proyeccion/obtener/' + rut);
    return this.proyeccionService.obtenerProyeccionesPorRut(rut);
  }

  @Get('detalle/:id')
  async obtenerPorId(@Param('id') id: string) {
    console.log('📩 GET /proyeccion/detalle/' + id);
    return this.proyeccionService.obtenerProyeccionPorId(parseInt(id));
  }

  @Delete('eliminar/:id')
  async eliminar(@Param('id') id: string) {
    console.log('📩 DELETE /proyeccion/eliminar/' + id);
    return this.proyeccionService.eliminarProyeccion(parseInt(id));
  }
}
