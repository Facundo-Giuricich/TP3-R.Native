import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// para que la notificación se muestre aunque la app esté abierta
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function crearCanal() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reportes', {
      name: 'Reportes',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
}

export async function pedirPermisoNotificaciones() {
  // en Android 13+ si no hay ningún canal creado el diálogo no aparece
  await crearCanal();
  // en iOS pedimos también las provisionales (llegan en silencio, sin diálogo)
  return Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true, allowProvisional: true },
  });
}

// en iOS las provisionales cuentan como permitidas
export function puedeNotificar(permiso: Notifications.NotificationPermissionsStatus) {
  return permiso.granted || permiso.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}

export async function avisarEn10Segundos(titulo: string, mensaje: string) {
  await crearCanal();
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: mensaje },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 10,
      channelId: 'reportes',
    },
  });
}
