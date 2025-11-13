import { ProyeccionService } from './proyeccion.service';
export declare class ProyeccionController {
    private readonly proyeccionService;
    constructor(proyeccionService: ProyeccionService);
    guardar(data: any): Promise<{
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
    obtenerPorRut(rut: string): Promise<({
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
    obtenerPorId(id: string): Promise<({
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
    eliminar(id: string): Promise<{
        codigo: string;
        id_alumno: number;
        nombre: string;
        id_proyeccion: number;
    }>;
}
