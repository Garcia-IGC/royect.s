import { PrismaService } from '../prisma/prisma.service';
export declare class ProyeccionService {
    private prisma;
    constructor(prisma: PrismaService);
    guardarProyeccion(data: any): Promise<{
        semestres: ({
            ramos: {
                codigo: string;
                id_semestre: number;
                asignatura: string;
                creditos: number;
                nivel: number;
                prereq: string;
                intento: number;
                status: string;
                cursada: boolean;
                id_ramo: number;
            }[];
        } & {
            semestre: number;
            id_proyeccion: number;
            id_semestre: number;
        })[];
    } & {
        codigo: string;
        id_alumno: number;
        nombre: string;
        id_proyeccion: number;
    }>;
    obtenerProyeccionesPorRut(rut: string): Promise<({
        semestres: ({
            ramos: {
                codigo: string;
                id_semestre: number;
                asignatura: string;
                creditos: number;
                nivel: number;
                prereq: string;
                intento: number;
                status: string;
                cursada: boolean;
                id_ramo: number;
            }[];
        } & {
            semestre: number;
            id_proyeccion: number;
            id_semestre: number;
        })[];
    } & {
        codigo: string;
        id_alumno: number;
        nombre: string;
        id_proyeccion: number;
    })[]>;
    obtenerProyeccionPorId(id: number): Promise<({
        semestres: ({
            ramos: {
                codigo: string;
                id_semestre: number;
                asignatura: string;
                creditos: number;
                nivel: number;
                prereq: string;
                intento: number;
                status: string;
                cursada: boolean;
                id_ramo: number;
            }[];
        } & {
            semestre: number;
            id_proyeccion: number;
            id_semestre: number;
        })[];
    } & {
        codigo: string;
        id_alumno: number;
        nombre: string;
        id_proyeccion: number;
    }) | null>;
    eliminarProyeccion(id: number): Promise<void>;
    actualizarProyeccion(id: number, data: any): Promise<{
        semestres: ({
            ramos: {
                codigo: string;
                id_semestre: number;
                asignatura: string;
                creditos: number;
                nivel: number;
                prereq: string;
                intento: number;
                status: string;
                cursada: boolean;
                id_ramo: number;
            }[];
        } & {
            semestre: number;
            id_proyeccion: number;
            id_semestre: number;
        })[];
    } & {
        codigo: string;
        id_alumno: number;
        nombre: string;
        id_proyeccion: number;
    }>;
}
