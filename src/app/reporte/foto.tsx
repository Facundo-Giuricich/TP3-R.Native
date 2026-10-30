import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { usePermiso } from '@/hooks/usePermiso';
import { useApp } from '@/lib/store';

export default function Foto() {
  const { cambiarBorrador } = useApp();
  const camara = usePermiso('camara');

  async function sacarFoto() {
    if (camara.estado !== 'concedido') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara' } });
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!resultado.canceled) {
      cambiarBorrador({ fotoUri: resultado.assets[0].uri });
      router.back();
    }
  }

  async function elegirDeGaleria() {
    const resultado = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.5 });
    if (!resultado.canceled) {
      cambiarBorrador({ fotoUri: resultado.assets[0].uri });
      router.back();
    }
  }

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.texto}>Adjuntá una foto del desperfecto.</Text>
      <Boton titulo="Sacar foto" onPress={sacarFoto} />
      <Boton titulo="Elegir de la galería" secundario onPress={elegirDeGaleria} />

      {camara.estado === 'bloqueado' && (
        <Text style={estilos.aviso}>
          La cámara está bloqueada. Igual podés elegir una foto de la galería.
        </Text>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: { flex: 1, padding: 16 },
  texto: { fontSize: 16, marginBottom: 10 },
  aviso: { marginTop: 12, color: '#b45309' },
});
