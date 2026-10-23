import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Boton } from '@/components/Boton';
import { usePermiso } from '@/hooks/usePermiso';
import { useApp } from '@/lib/store';
import { obtenerUbicacion } from '@/lib/ubicacion';

const sectores = ['Patio', 'Estacionamiento', 'Pasillo', 'Aula', 'Baños', 'Biblioteca'];

export default function UbicacionPantalla() {
  const { cambiarBorrador } = useApp();
  const { estado, parcial } = usePermiso('ubicacion');
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState('');

  async function usarMiUbicacion() {
    if (estado !== 'concedido') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'ubicacion' } });
      return;
    }
    setBuscando(true);
    const datos = await obtenerUbicacion();
    setBuscando(false);

    if (!datos) {
      setError('No se pudo obtener tu ubicación. Elegí el sector a mano.');
      return;
    }
    cambiarBorrador({ ubicacion: { tipo: 'gps', ...datos } });
    router.back();
  }

  function elegirSector(sector: string) {
    cambiarBorrador({ ubicacion: { tipo: 'sector', sector } });
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Boton titulo="Usar mi ubicación actual" onPress={usarMiUbicacion} />
      {buscando && <ActivityIndicator />}

      {estado === 'concedido' && parcial && (
        <Text style={estilos.aviso}>
          Tenés activada la ubicación aproximada, así que no vamos a guardar coordenadas exactas.
        </Text>
      )}
      {estado === 'bloqueado' && (
        <Text style={estilos.aviso}>La ubicación está bloqueada. Elegí el sector a mano.</Text>
      )}
      {error ? <Text style={estilos.aviso}>{error}</Text> : null}

      <Text style={estilos.label}>O elegí el sector:</Text>
      {sectores.map((sector) => (
        <Pressable key={sector} style={estilos.sector} onPress={() => elegirSector(sector)}>
          <Text>{sector}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16 },
  aviso: { color: '#b45309', marginTop: 8 },
  label: { fontWeight: 'bold', marginTop: 20, marginBottom: 6 },
  sector: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 6 },
});
