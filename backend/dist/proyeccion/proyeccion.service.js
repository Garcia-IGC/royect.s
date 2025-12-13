"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProyeccionService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProyeccionService = class ProyeccionService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async guardarProyeccion(data) {
        const { rut, carrera, codigo, plan } = data;
        let alumno = await this.prisma.alumno.findUnique({
            where: { id_alumno: parseInt(rut) },
        });
        if (!alumno) {
            alumno = await this.prisma.alumno.create({
                data: { id_alumno: parseInt(rut) },
            });
        }
        const proyeccion = await this.prisma.proyeccion.create({
            data: {
                id_alumno: alumno.id_alumno,
                codigo,
                nombre: carrera,
                semestres: {
                    create: Object.entries(plan).map(([num, ramos]) => ({
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
    async obtenerProyeccionesPorRut(rut) {
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
    async obtenerProyeccionPorId(id) {
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
    async eliminarProyeccion(id) {
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
    async actualizarProyeccion(id, data) {
        const { rut, carrera, codigo, plan } = data;
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
        const proyeccionActualizada = await this.prisma.proyeccion.update({
            where: { id_proyeccion: id },
            data: {
                codigo,
                nombre: carrera,
                semestres: {
                    create: Object.entries(plan).map(([num, ramos]) => ({
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
};
exports.ProyeccionService = ProyeccionService;
exports.ProyeccionService = ProyeccionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProyeccionService);
//# sourceMappingURL=proyeccion.service.js.map