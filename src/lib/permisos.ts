import type { PermissionResponse } from 'expo';
import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync } from 'expo-audio';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { pedirPermisoNotificaciones } from './notificaciones';

export type Recurso = 'camara' | 'ubicacion' | 'notificaciones' | 'microfono';
export type EstadoPermiso = 'cargando' | 'concedido' | 'preguntable' | 'bloqueado';

export const RECURSOS: Recurso[] = ['camara', 'ubicacion', 'notificaciones', 'microfono'];

export const TEXTOS: Record<Recurso, { titulo: string; beneficio: string; rutaAndroid: string; rutaIos: string }> = {
  camara: {
    titulo: 'Cámara',
    beneficio: 'Usamos tu cámara para leer el QR de la puerta del aula y sacar una foto del desperfecto.',
    rutaAndroid: 'Ajustes > Apps > Mantenimiento IPF > Permisos > Cámara > Permitir solo mientras se usa la app',
    rutaIos: 'Ajustes > Mantenimiento IPF > activar Cámara',
  },
  ubicacion: {
    titulo: 'Ubicación',
    beneficio: 'Usamos tu ubicación para marcar en qué parte del instituto está el problema.',
    rutaAndroid: 'Ajustes > Apps > Mantenimiento IPF > Permisos > Ubicación > Permitir solo mientras se usa la app',
    rutaIos: 'Ajustes > Mantenimiento IPF > Ubicación > Al usar la app',
  },
  notificaciones: {
    titulo: 'Notificaciones',
    beneficio: 'Te avisamos cuando se resuelva el problema que reportaste.',
    rutaAndroid: 'Ajustes > Apps > Mantenimiento IPF > Notificaciones > activar',
    rutaIos: 'Ajustes > Notificaciones > Mantenimiento IPF > Permitir notificaciones',
  },
  microfono: {
    titulo: 'Micrófono',
    beneficio: 'Usamos tu micrófono para grabar una nota de voz que explique el problema.',
    rutaAndroid: 'Ajustes > Apps > Mantenimiento IPF > Permisos > Micrófono > Permitir solo mientras se usa la app',
    rutaIos: 'Ajustes > Mantenimiento IPF > activar Micrófono',
  },
};

export function esRecurso(valor: unknown): valor is Recurso {
  return typeof valor === 'string' && (RECURSOS as string[]).includes(valor);
}

export function consultarPermiso(recurso: Recurso): Promise<PermissionResponse> {
  if (recurso === 'camara') return Camera.getCameraPermissionsAsync();
  if (recurso === 'ubicacion') return Location.getForegroundPermissionsAsync();
  if (recurso === 'microfono') return getRecordingPermissionsAsync();
  return Notifications.getPermissionsAsync();
}

export function pedirPermiso(recurso: Recurso): Promise<PermissionResponse> {
  if (recurso === 'camara') return Camera.requestCameraPermissionsAsync();
  if (recurso === 'ubicacion') return Location.requestForegroundPermissionsAsync();
  if (recurso === 'microfono') return requestRecordingPermissionsAsync();
  return pedirPermisoNotificaciones();
}

export function calcularEstado(respuesta: PermissionResponse): EstadoPermiso {
  if (respuesta.granted || esProvisional(respuesta)) return 'concedido';
  if (respuesta.canAskAgain) return 'preguntable';
  return 'bloqueado';
}

export function esProvisional(respuesta: PermissionResponse) {
  const notif = respuesta as Notifications.NotificationPermissionsStatus;
  return notif.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export function esParcial(recurso: Recurso, respuesta: PermissionResponse) {
  if (recurso !== 'ubicacion' || !respuesta.granted) return false;
  const ubic = respuesta as Location.LocationPermissionResponse;
  return ubic.android?.accuracy === 'coarse' || ubic.ios?.accuracy === 'reduced';
}

export function detallePermiso(recurso: Recurso, respuesta: PermissionResponse) {
  let texto = `status: ${respuesta.status} | canAskAgain: ${respuesta.canAskAgain}`;
  if (recurso === 'ubicacion') {
    const ubic = respuesta as Location.LocationPermissionResponse;
    if (ubic.android) texto += ` | accuracy: ${ubic.android.accuracy}`;
    if (ubic.ios) texto += ` | accuracy: ${ubic.ios.accuracy}`;
  }
  if (recurso === 'notificaciones') {
    if (esProvisional(respuesta)) texto += ' | provisional';
  }
  return texto;
}
