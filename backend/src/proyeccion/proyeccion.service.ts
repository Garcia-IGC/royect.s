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

  async obtenerProyeccionesPorRut(rut: string) {
    const alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: parseInt(rut) },
      include: {
        proyecciones: {
          include: {
            semestres: {
              include: {
                ramos: true,
              },
              orderBy: {
                semestre: 'asc',
              },
            },
          },
          orderBy: {
            id_proyeccion: 'desc',
          },
        },
      },
    });

    if (!alumno) {
      return [];
    }

    return alumno.proyecciones;
  }

  async obtenerProyeccionPorId(id: number) {
    const proyeccion = await this.prisma.proyeccion.findUnique({
      where: { id_proyeccion: id },
      include: {
        semestres: {
          include: {
            ramos: true,
          },
          orderBy: {
            semestre: 'asc',
          },
        },
      },
    });

    return proyeccion;
  }

  async eliminarProyeccion(id: number) {
    // Primero obtener todos los semestres de la proyección
    const semestres = await this.prisma.semestre.findMany({
      where: { id_proyeccion: id },
      select: { id_semestre: true },
    });

    // Eliminar todos los ramos de cada semestre
    for (const semestre of semestres) {
      await this.prisma.ramo.deleteMany({
        where: { id_semestre: semestre.id_semestre },
      });
    }

    // Eliminar todos los semestres
    await this.prisma.semestre.deleteMany({
      where: { id_proyeccion: id },
    });

    // Finalmente eliminar la proyección
    return await this.prisma.proyeccion.delete({
      where: { id_proyeccion: id },
    });
  }
}
