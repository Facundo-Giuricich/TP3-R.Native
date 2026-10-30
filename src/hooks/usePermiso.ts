import type { PermissionResponse } from 'expo';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { calcularEstado, consultarPermiso, EstadoPermiso, esParcial, pedirPermiso, Recurso } from '@/lib/permisos';
import { useRevisarAlVolver } from './useRevisarAlVolver';

export function usePermiso(recurso: Recurso) {
  const [respuesta, setRespuesta] = useState<PermissionResponse | null>(null);

  const revisar = useCallback(async () => {
    const r = await consultarPermiso(recurso);
    setRespuesta(r);
  }, [recurso]);

  useFocusEffect(
    useCallback(() => {
      revisar();
    }, [revisar])
  );

  useRevisarAlVolver(revisar);

  const pedir = useCallback(async () => {
    const r = await pedirPermiso(recurso);
    setRespuesta(r);
    return r;
  }, [recurso]);

  const abrirAjustes = useCallback(() => {
    Linking.openSettings();
  }, []);

  const estado: EstadoPermiso = respuesta ? calcularEstado(respuesta) : 'cargando';
  const parcial = respuesta ? esParcial(recurso, respuesta) : false;

  return { estado, parcial, respuesta, pedir, abrirAjustes };
}
