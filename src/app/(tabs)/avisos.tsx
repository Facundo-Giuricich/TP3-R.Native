import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useApp } from '@/lib/store';

export default function Avisos() {
  const { avisos } = useApp();

  return (
    <View style={estilos.pantalla}>
      <FlatList
        data={avisos}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={estilos.vacio}>
            No tenés avisos. Si no activás las notificaciones, los avisos de tus reportes aparecen acá.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={estilos.item}>
            <Text style={estilos.titulo}>{item.titulo}</Text>
            <Text>{item.mensaje}</Text>
            <Text style={estilos.fecha}>{item.fecha}</Text>
          </View>
        )}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 16 },
  vacio: { textAlign: 'center', marginTop: 30, color: '#666' },
  item: { padding: 12, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, marginBottom: 8 },
  titulo: { fontWeight: 'bold' },
  fecha: { fontSize: 12, color: '#666', marginTop: 4 },
});
