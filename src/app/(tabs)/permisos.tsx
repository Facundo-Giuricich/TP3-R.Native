import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { usePermiso } from '@/hooks/usePermiso';
import { detallePermiso, esProvisional, Recurso, RECURSOS, TEXTOS } from '@/lib/permisos';

function FilaPermiso({ recurso }: { recurso: Recurso }) {
  const { estado, parcial, respuesta, abrirAjustes } = usePermiso(recurso);
  let textoEstado: string = estado;
  if (estado === 'concedido' && parcial) textoEstado = 'parcial';
  if (respuesta && esProvisional(respuesta)) textoEstado = 'provisional (iOS)';

  return (
    <View style={estilos.fila}>
      <Text style={estilos.nombre}>{TEXTOS[recurso].titulo}</Text>
      <Text>Estado: {textoEstado}</Text>
      {respuesta && <Text style={estilos.detalle}>{detallePermiso(recurso, respuesta)}</Text>}

      {estado === 'preguntable' && (
        <Boton
          titulo="Pedir permiso"
          secundario
          onPress={() => router.push({ pathname: '/permisos/[recurso]', params: { recurso } })}
        />
      )}
      {estado === 'bloqueado' && <Boton titulo="Abrir Ajustes" secundario onPress={abrirAjustes} />}
    </View>
  );
}

export default function PanelPermisos() {
  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.plataforma}>
        Plataforma: {Platform.OS} (versión {String(Platform.Version)})
      </Text>

      {RECURSOS.map((recurso) => (
        <FilaPermiso key={recurso} recurso={recurso} />
      ))}

      <View style={estilos.fila}>
        <Text style={estilos.nombre}>Fotos</Text>
        <Text>No se pide: para elegir fotos usamos el selector del sistema.</Text>
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16 },
  plataforma: { marginBottom: 12, color: '#444' },
  fila: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10, gap: 4 },
  nombre: { fontSize: 16, fontWeight: 'bold' },
  detalle: { fontSize: 12, color: '#666' },
});
