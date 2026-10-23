import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  titulo: string;
  onPress: () => void;
  secundario?: boolean;
};

export function Boton({ titulo, onPress, secundario }: Props) {
  return (
    <Pressable style={[estilos.boton, secundario && estilos.secundario]} onPress={onPress}>
      <Text style={[estilos.texto, secundario && estilos.textoSecundario]}>{titulo}</Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    backgroundColor: '#1f5fa8',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 6,
  },
  secundario: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#1f5fa8',
  },
  texto: { color: 'white', fontWeight: 'bold' },
  textoSecundario: { color: '#1f5fa8' },
});
