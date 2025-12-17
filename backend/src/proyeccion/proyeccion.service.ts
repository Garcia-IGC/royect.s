import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProyeccionService {
  constructor(private prisma: PrismaService) {}

  /*
  * guardarProyeccion()
  * Funcion utilizada para guardar los datos realizados en una proyeccion
  * dentro de la base de datos
  *
  */
  async guardarProyeccion(data: any) {
    const { rut, carrera, codigo, plan } = data;

    // Busca al alumno con el rut otorgado
    let alumno = await this.prisma.alumno.findUnique({
      where: { id_alumno: parseInt(rut) },
    });

    // si no existe lo crea en la bd
    if (!alumno) {
      alumno = await this.prisma.alumno.create({
        data: { id_alumno: parseInt(rut) },
      });
    }

    // Crea la respectiva proyeccion con sus semestres y ramos
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

  /*
  * obtenerProyeccionesPorRut()
  * Funcion utilizada para cargar los datos de proyecciones de un alumno x
  * dentro de la base de datos
  *
  */
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
    await this.prisma.$transaction(async (tx) => {
    const semestres = await tx.semestre.findMany({
    where: { id_proyeccion: id },
    select: { id_semestre: true },
    });

    for (const s of semestres) {
      await tx.ramo.deleteMany({ where: { id_semestre: s.id_semestre } });
    }

    await tx.semestre.deleteMany({ where: { id_proyeccion: id } });

    await tx.proyeccion.delete({ where: { id_proyeccion: id } });
    });
  }

  async actualizarProyeccion(id: number, data: any) {
    const { rut, carrera, codigo, plan } = data;

    // Primero, eliminar los semestres y ramos existentes
    await this.prisma.$transaction(async (tx) => {
      const semestres = await tx.semestre.findMany({
        where: { id_proyeccion: id },
        select: { id_semestre: true },
      });

      for (const s of semestres) {
        await tx.ramo.deleteMany({ where: { id_semestre: s.id_semestre } });
      }

      await tx.semestre.deleteMany({ where: { id_proyeccion: id } });
    });

    // Luego, actualizar la proyección con los nuevos datos
    const proyeccionActualizada = await this.prisma.proyeccion.update({
      where: { id_proyeccion: id },
      data: {
        codigo,
        nombre: carrera,
        semestres: {
          create: Object.entries(plan).map(([num, ramos]: [string, any[]]) => ({
            semestre: parseInt(num),
            ramos: {
              create: ramos.map((r) => ({
                codigo: r.codigo,
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

    return proyeccionActualizada;
  }


  async obtenerDemandaPorAsignatura() {
    
    const grupos = await this.prisma.ramo.groupBy({
      by: ['codigo', 'asignatura'],
      _count: { _all: true },
    });

    grupos.sort((a, b) => (b._count._all - a._count._all));
    
    return grupos.map(g => ({
      codigo: g.codigo,
      asignatura: g.asignatura,
      demanda: g._count._all,
    }));
  }
}
