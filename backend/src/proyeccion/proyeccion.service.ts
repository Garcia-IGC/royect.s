import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProyeccionService {
  constructor(private prisma: PrismaService) {}

  async guardarProyeccion(data: any) {
    const { rut, carrera, codigo, plan } = data;

    // Buscar o crear alumno
    let alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: parseInt(rut) },
    });

    if (!alumno) {
      alumno = await this.prisma.alumno.create({
        data: { id_alumno: parseInt(rut) },
      });
    }

    // Crear proyección con sus semestres y ramos
    const proyeccion = await this.prisma.proyeccion.create({
      data: {
        id_alumno: alumno.id_alumno,
        codigo,
        nombre: carrera,
        semestres: {
          create: Object.entries(plan).map(([num, ramos]: [string, any[]]) => ({
            semestre: parseInt(num),
            ramos: {
              create: ramos.map((r) => ({
                codigo: r.codigo,
                // ⚠️ usa 'asignatura' o 'asigantura' según tu modelo
                asignatura: r.asignatura,
                creditos: r.creditos ?? 0,
                nivel: r.nivel ?? 0,
                prereq: r.prereq ?? '',
                intento: r.intento ?? 1,
                status: r.status ?? 'NO CURSADO',
                cursada: r.cursada ?? false,
              })),
            },
          })),
        },
      },
      include: { semestres: { include: { ramos: true } } },
    });

    return proyeccion;
  }
}
