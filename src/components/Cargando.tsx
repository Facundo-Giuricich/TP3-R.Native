import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export function Cargando() {
  return (
    <View style={estilos.contenedor}>
      <ActivityIndicator size="large" />
      <Text>Revisando permiso...</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
});
