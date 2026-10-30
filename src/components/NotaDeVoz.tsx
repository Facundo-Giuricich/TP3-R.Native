import { RecordingPresets, setAudioModeAsync, useAudioPlayer, useAudioRecorder } from 'expo-audio';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { usePermiso } from '@/hooks/usePermiso';
import { Boton } from './Boton';

type Props = {
  uri: string | null;
  onGrabada: (uri: string | null) => void;
};

export function GrabarNota({ uri, onGrabada }: Props) {
  const microfono = usePermiso('microfono');
  const grabador = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [grabando, setGrabando] = useState(false);

  async function empezar() {
    if (microfono.estado !== 'concedido') {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'microfono' } });
      return;
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await grabador.prepareToRecordAsync();
    grabador.record();
    setGrabando(true);
  }

  async function detener() {
    await grabador.stop();
    setGrabando(false);
    onGrabada(grabador.uri);
  }

  return (
    <View>
      {grabando ? (
        <>
          <Text style={estilos.grabando}>Grabando...</Text>
          <Boton titulo="Detener" onPress={detener} />
        </>
      ) : (
        <Boton titulo={uri ? 'Grabar de nuevo' : 'Grabar nota de voz'} secundario onPress={empezar} />
      )}

      {uri && !grabando && <EscucharNota uri={uri} />}

      {microfono.estado === 'bloqueado' && (
        <Text style={estilos.aviso}>El micrófono está bloqueado. Podés escribir la descripción.</Text>
      )}
    </View>
  );
}

export function EscucharNota({ uri }: { uri: string }) {
  const reproductor = useAudioPlayer(uri);

  function escuchar() {
    reproductor.seekTo(0);
    reproductor.play();
  }

  return <Boton titulo="Escuchar nota de voz" secundario onPress={escuchar} />;
}

const estilos = StyleSheet.create({
  grabando: { color: '#b91c1c', fontWeight: 'bold', marginTop: 6 },
  aviso: { color: '#b45309', marginTop: 4 },
});
