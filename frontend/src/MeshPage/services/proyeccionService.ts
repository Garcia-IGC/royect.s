import apiClient from './api';

interface GuardarProyeccionPayload {
  rut: string;
  codigo: string;
  carrera: string;
  plan: Record<string, any[]>;
}

export const proyeccionService = {
  guardar: async (payload: GuardarProyeccionPayload) => {
    const response = await apiClient.post('/proyeccion/guardar', payload);
    return response.data;
  },

  actualizar: async (id: number, payload: GuardarProyeccionPayload) => {
    const response = await apiClient.put(`/proyeccion/actualizar/${id}`, payload);
    return response.data;
  },

  demanda: async () => {
    const response = await apiClient.get('/proyeccion/demanda');
    return response.data as Array<{ codigo: string; asignatura: string; demanda: number }>;
  },
};
