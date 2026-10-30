import * as Location from 'expo-location';
import { Ubicacion } from './tipos';

export async function obtenerUbicacion() {
  try {
    const permiso = await Location.getForegroundPermissionsAsync();
    if (!permiso.granted) return null;

    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const aproximada = permiso.android?.accuracy === 'coarse' || permiso.ios?.accuracy === 'reduced';

    return { latitud: pos.coords.latitude, longitud: pos.coords.longitude, aproximada };
  } catch (error) {
    console.log('Error al obtener la ubicación', error);
    return null;
  }
}

export function textoUbicacion(ubicacion: Ubicacion | null) {
  if (!ubicacion) return 'Sin ubicación';
  if (ubicacion.tipo === 'sector') return `Sector: ${ubicacion.sector}`;
  if (ubicacion.aproximada) return 'Ubicación aproximada';
  return `${ubicacion.latitud.toFixed(5)}, ${ubicacion.longitud.toFixed(5)}`;
}
