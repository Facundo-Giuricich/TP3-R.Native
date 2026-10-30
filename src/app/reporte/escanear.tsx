import { CameraView } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { Boton } from '@/components/Boton';
import { Cargando } from '@/components/Cargando';
import { PantallaPrevia } from '@/components/PantallaPrevia';
import { usePermiso } from '@/hooks/usePermiso';
import { useApp } from '@/lib/store';

export default function Escanear() {
  const { cambiarBorrador } = useApp();
  const { estado, pedir, abrirAjustes } = usePermiso('camara');
  const [codigo, setCodigo] = useState('');
  const yaLeido = useRef(false);

  function usarCodigo(valor: string) {
    if (!valor.trim()) return;
    cambiarBorrador({ aula: valor.trim() });
    router.back();
  }

  if (estado === 'cargando') {
    return <Cargando />;
  }

  if (estado === 'concedido') {
    return (
      <CameraView
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (yaLeido.current) return;
          yaLeido.current = true;
          usarCodigo(data);
        }}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <PantallaPrevia
        recurso="camara"
        bloqueado={estado === 'bloqueado'}
        onContinuar={pedir}
        onAbrirAjustes={abrirAjustes}
      />

      <Text style={estilos.label}>Si no querés usar la cámara, escribí el código del aula:</Text>
      <TextInput style={estilos.input} value={codigo} onChangeText={setCodigo} placeholder="Ej: AULA-12" />
      <Boton titulo="Usar este código" secundario onPress={() => usarCodigo(codigo)} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16 },
  label: { marginTop: 20, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
});
