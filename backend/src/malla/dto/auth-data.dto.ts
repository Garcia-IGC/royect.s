class CarreraDto {
    codigo: string;
    nombre: string;
    catalogo: string;
}

export class AuthDataDto {
    rut: string;
    carreras: CarreraDto[];
}

export interface MallaResultado {
  carrera: string;
  codigo: string;
  catalogo: string;
  malla?: any;
  error?: boolean;
}