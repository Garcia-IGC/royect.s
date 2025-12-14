import apiClient from './api';
import { AuthDataDto } from '../types';

interface MallaPayload {
  rut: string;
  carreras: Array<{
    codigo: string;
    nombre: string;
    catalogo: string;
  }>;
}

export const mallaService = {
  fetchMallaAvance: async (payload: MallaPayload): Promise<AuthDataDto> => {
    const response = await apiClient.post<AuthDataDto>('/malla/malla-avance', payload);
    return response.data;
  },
};
