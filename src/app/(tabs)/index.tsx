import { Link, router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { useApp } from '@/lib/store';
import { EstadoReporte } from '@/lib/tipos';

const colorEstado: Record<EstadoReporte, string> = {
  pendiente: '#b45309',
  'en curso': '#1f5fa8',
  resuelto: '#15803d',
};

export default function Inicio() {
  const { reportes } = useApp();

  return (
    <View style={estilos.pantalla}>
      <Boton titulo="Nuevo reporte" onPress={() => router.push('/reporte/nuevo')} />
      <Link href="/ajustes-app" style={estilos.link}>
        Ajustes de avisos
      </Link>

      <FlatList
        data={reportes}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={estilos.vacio}>Todavía no cargaste ningún reporte.</Text>}
        renderItem={({ item }) => (
          <Pressable style={estilos.item} onPress={() => router.push(`/reporte/${item.id}`)}>
            <Text style={estilos.titulo}>{item.titulo}</Text>
            <Text>
              Aula: {item.aula || '-'} | {item.categoria}
            </Text>
            <Text style={{ color: colorEstado[item.estado], fontWeight: 'bold' }}>{item.estado}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 16 },
  link: { color: '#1f5fa8', marginBottom: 12, textAlign: 'right' },
  vacio: { textAlign: 'center', marginTop: 30, color: '#666' },
  item: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 8, gap: 2 },
  titulo: { fontSize: 16, fontWeight: 'bold' },
});
