import { Module } from '@nestjs/common';
import { ProyeccionController } from './proyeccion.controller';
import { ProyeccionService } from './proyeccion.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProyeccionController],
  providers: [ProyeccionService, PrismaService],
})
export class ProyeccionModule {}
