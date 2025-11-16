export interface Asignatura {
  codigo: string;
  asignatura: string;
  creditos: number;
  nivel: number;
  prereq: string;
  status: string;
  intento: number;
}

export interface CarreraDto {
  codigo: string;
  carrera: string;
  catalogo: string;
  malla: Asignatura[];
}

export interface AuthDataDto {
  rut: string;
  carreras: CarreraDto[];
}