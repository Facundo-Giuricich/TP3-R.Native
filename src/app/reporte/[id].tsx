import * as Notifications from 'expo-notifications';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { EscucharNota } from '@/components/NotaDeVoz';
import { avisarEn10Segundos, puedeNotificar } from '@/lib/notificaciones';
import { useApp } from '@/lib/store';
import { textoUbicacion } from '@/lib/ubicacion';

export default function DetalleReporte() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { reportes, cambiarEstado, agregarAviso, quiereAvisos } = useApp();
  const [mensaje, setMensaje] = useState('');

  const reporte = reportes.find((r) => r.id === id);

  if (!reporte) {
    return (
      <View style={estilos.pantalla}>
        <Text style={estilos.titulo}>No existe el reporte "{String(id)}".</Text>
        <Boton titulo="Volver al inicio" onPress={() => router.replace('/')} />
      </View>
    );
  }

  async function simularResolucion() {
    if (!reporte) return;
    cambiarEstado(reporte.id, 'resuelto');

    const titulo = 'Reporte resuelto';
    const texto = `Se resolvió "${reporte.titulo}" (aula ${reporte.aula || '-'}).`;
    const permiso = await Notifications.getPermissionsAsync();

    if (quiereAvisos && puedeNotificar(permiso)) {
      await avisarEn10Segundos(titulo, texto);
      setMensaje('Listo, en 10 segundos te llega la notificación.');
    } else {
      agregarAviso(titulo, texto);
      setMensaje('Las notificaciones no están activadas, el aviso quedó en la pestaña Avisos.');
    }
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.titulo}>{reporte.titulo}</Text>
      <Text>Estado: {reporte.estado}</Text>
      <Text>Aula: {reporte.aula || '-'}</Text>
      <Text>Categoría: {reporte.categoria}</Text>
      <Text>Ubicación: {textoUbicacion(reporte.ubicacion)}</Text>
      <Text>Fecha: {reporte.fecha}</Text>
      {reporte.descripcion ? <Text style={estilos.descripcion}>{reporte.descripcion}</Text> : null}
      {reporte.fotoUri && <Image source={{ uri: reporte.fotoUri }} style={estilos.foto} />}
      {reporte.notaVozUri && <EscucharNota uri={reporte.notaVozUri} />}

      {reporte.estado === 'pendiente' && (
        <Boton titulo="Marcar en curso" secundario onPress={() => cambiarEstado(reporte.id, 'en curso')} />
      )}
      {reporte.estado !== 'resuelto' && <Boton titulo="Simular resolución" onPress={simularResolucion} />}
      {mensaje ? <Text style={estilos.mensaje}>{mensaje}</Text> : null}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, gap: 6 },
  titulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  descripcion: { marginTop: 6, fontStyle: 'italic' },
  foto: { width: '100%', height: 220, borderRadius: 6, marginVertical: 10 },
  mensaje: { color: '#15803d', marginTop: 8 },
});
