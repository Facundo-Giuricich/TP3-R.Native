import { Platform, StyleSheet, Text, View } from 'react-native';
import { Recurso, TEXTOS } from '@/lib/permisos';
import { Boton } from './Boton';

type Props = {
  recurso: Recurso;
  bloqueado: boolean;
  onContinuar: () => void;
  onAbrirAjustes: () => void;
};

export function PantallaPrevia({ recurso, bloqueado, onContinuar, onAbrirAjustes }: Props) {
  const texto = TEXTOS[recurso];

  if (bloqueado) {
    return (
      <View style={estilos.caja}>
        <Text style={estilos.titulo}>{texto.titulo}: permiso bloqueado</Text>
        <Text style={estilos.parrafo}>
          Ya dijiste que no a este permiso y el sistema no nos deja volver a preguntarte.
        </Text>
        <Text style={estilos.parrafo}>Si lo querés activar, andá a:</Text>
        <Text style={estilos.ruta}>{Platform.OS === 'ios' ? texto.rutaIos : texto.rutaAndroid}</Text>
        <Boton titulo="Abrir Ajustes" onPress={onAbrirAjustes} />
      </View>
    );
  }

  return (
    <View style={estilos.caja}>
      <Text style={estilos.titulo}>{texto.titulo}</Text>
      <Text style={estilos.parrafo}>{texto.beneficio}</Text>
      <Text style={estilos.aclaracion}>Lo podés cambiar cuando quieras desde Ajustes.</Text>
      <Boton titulo="Continuar" onPress={onContinuar} />
    </View>
  );
}

const estilos = StyleSheet.create({
  caja: { padding: 20, gap: 10 },
  titulo: { fontSize: 22, fontWeight: 'bold' },
  parrafo: { fontSize: 16 },
  aclaracion: { fontSize: 14, color: '#555' },
  ruta: { fontSize: 14, fontStyle: 'italic', backgroundColor: '#eee', padding: 8 },
});
