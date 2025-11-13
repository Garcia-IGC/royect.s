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
            id_proyeccion: number;
            semestre: number;
            id_semestre: number;
        })[];
    } & {
        codigo: string;
        nombre: string;
        id_proyeccion: number;
        id_alumno: number;
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
            id_proyeccion: number;
            semestre: number;
            id_semestre: number;
        })[];
    } & {
        codigo: string;
        nombre: string;
        id_proyeccion: number;
        id_alumno: number;
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
            id_proyeccion: number;
            semestre: number;
            id_semestre: number;
        })[];
    } & {
        codigo: string;
        nombre: string;
        id_proyeccion: number;
        id_alumno: number;
    }) | null>;
    eliminar(id: string): Promise<void>;
}
