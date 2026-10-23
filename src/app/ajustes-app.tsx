import { router } from 'expo-router';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { usePermiso } from '@/hooks/usePermiso';
import { useApp } from '@/lib/store';

export default function AjustesApp() {
  const { quiereAvisos, setQuiereAvisos } = useApp();
  const { estado } = usePermiso('notificaciones');

  const activado = quiereAvisos && estado === 'concedido';

  function cambiar(valor: boolean) {
    setQuiereAvisos(valor);
    // el permiso se pide recién acá, cuando la persona activa el interruptor
    if (valor && estado !== 'concedido') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'notificaciones' } });
    }
  }

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.fila}>
        <Text style={estilos.texto}>Avisarme cuando se resuelva mi reporte</Text>
        <Switch value={activado} onValueChange={cambiar} />
      </View>

      {quiereAvisos && (estado === 'preguntable' || estado === 'bloqueado') && (
        <Text style={estilos.aviso}>
          Las notificaciones no están permitidas. Los avisos te van a aparecer en la pestaña Avisos.
        </Text>
      )}
      {!quiereAvisos && <Text style={estilos.gris}>Mientras esté apagado, los avisos quedan en la pestaña Avisos.</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, gap: 12 },
  fila: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  texto: { fontSize: 16, flex: 1 },
  aviso: { color: '#b45309' },
  gris: { color: '#666' },
});
