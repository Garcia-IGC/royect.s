import { useState, useEffect } from 'react';
import { mallaService } from '../services/mallaService';
import { AuthDataDto } from '../types';

interface UseMallaProps {
  userData: { rut: string; carreras: any[] } | null;
}

export const useMalla = ({ userData }: UseMallaProps) => {
  const [data, setData] = useState<AuthDataDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userData) {
      setLoading(false);
      return;
    }

    if (!userData.carreras || !Array.isArray(userData.carreras)) {
      setLoading(false);
      setError('No se encontraron carreras para este usuario');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      rut: userData.rut,
      carreras: userData.carreras.map((c) => ({
        codigo: c.codigo,
        nombre: c.nombre,
        catalogo: c.catalogo,
      })),
    };

    const fetchData = async () => {
      try {
        const result = await mallaService.fetchMallaAvance(payload);
        setData(result);
      } catch (err) {
        setError('Error al obtener las mallas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userData]);

  return { data, loading, error };
};
