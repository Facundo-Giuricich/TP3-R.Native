import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { PantallaPrevia } from '@/components/PantallaPrevia';
import { usePermiso } from '@/hooks/usePermiso';
import { esRecurso, Recurso, TEXTOS } from '@/lib/permisos';

export default function PermisoModal() {
  const { recurso, siguiente } = useLocalSearchParams<{ recurso: string; siguiente?: string }>();

  if (!esRecurso(recurso)) {
    return (
      <View style={estilos.pantalla}>
        <Text>El permiso "{recurso}" no existe.</Text>
      </View>
    );
  }

  return <Contenido recurso={recurso} siguiente={siguiente} />;
}

function Contenido({ recurso, siguiente }: { recurso: Recurso; siguiente?: string }) {
  const { estado, pedir, abrirAjustes } = usePermiso(recurso);

  function cerrar(concedido: boolean) {
    if (concedido && siguiente === 'escanear') {
      router.replace('/reporte/escanear');
    } else {
      router.back();
    }
  }

  async function continuar() {
    const respuesta = await pedir();
    cerrar(respuesta.granted);
  }

  if (estado === 'cargando') return <Cargando />;

  if (estado === 'concedido') {
    return (
      <View style={estilos.pantalla}>
        <Text style={estilos.texto}>Listo, el permiso de {TEXTOS[recurso].titulo.toLowerCase()} está activado.</Text>
        <Boton titulo="Continuar" onPress={() => cerrar(true)} />
      </View>
    );
  }

  return (
    <PantallaPrevia
      recurso={recurso}
      bloqueado={estado === 'bloqueado'}
      onContinuar={continuar}
      onAbrirAjustes={abrirAjustes}
    />
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 20, gap: 10 },
  texto: { fontSize: 16 },
});
