import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Boton } from '@/components/Boton';
import { GrabarNota } from '@/components/NotaDeVoz';
import { usePermiso } from '@/hooks/usePermiso';
import { useApp } from '@/lib/store';
import { Categoria } from '@/lib/tipos';
import { textoUbicacion } from '@/lib/ubicacion';

const categorias: Categoria[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];

export default function NuevoReporte() {
  const { borrador, cambiarBorrador, guardarReporte } = useApp();
  const camara = usePermiso('camara');
  const [error, setError] = useState('');

  function escanear() {
    if (camara.estado === 'concedido') {
      router.push('/reporte/escanear');
    } else {
      router.push({ pathname: '/permisos/[recurso]', params: { recurso: 'camara', siguiente: 'escanear' } });
    }
  }

  function guardar() {
    if (!borrador.titulo.trim()) {
      setError('Poné un título para el reporte.');
      return;
    }
    guardarReporte();
    router.back();
  }

  return (
    <ScrollView contentContainerStyle={estilos.pantalla}>
      <Text style={estilos.label}>Título</Text>
      <TextInput
        style={estilos.input}
        value={borrador.titulo}
        onChangeText={(titulo) => cambiarBorrador({ titulo })}
        placeholder="Ej: luz quemada"
      />

      <Text style={estilos.label}>Descripción</Text>
      <TextInput
        style={[estilos.input, { height: 80 }]}
        multiline
        value={borrador.descripcion}
        onChangeText={(descripcion) => cambiarBorrador({ descripcion })}
        placeholder="Contá qué pasa"
      />
      <GrabarNota uri={borrador.notaVozUri} onGrabada={(notaVozUri) => cambiarBorrador({ notaVozUri })} />

      <Text style={estilos.label}>Aula</Text>
      <TextInput
        style={estilos.input}
        value={borrador.aula}
        onChangeText={(aula) => cambiarBorrador({ aula })}
        placeholder="Escribila o escaneá el QR"
      />
      <Boton titulo="Escanear QR del aula" secundario onPress={escanear} />

      <Text style={estilos.label}>Categoría</Text>
      <View style={estilos.categorias}>
        {categorias.map((cat) => (
          <Pressable
            key={cat}
            style={[estilos.categoria, borrador.categoria === cat && estilos.categoriaElegida]}
            onPress={() => cambiarBorrador({ categoria: cat })}>
            <Text style={borrador.categoria === cat ? { color: 'white' } : undefined}>{cat}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={estilos.label}>Foto</Text>
      {borrador.fotoUri ? (
        <Image source={{ uri: borrador.fotoUri }} style={estilos.foto} />
      ) : (
        <Text style={estilos.gris}>Sin foto</Text>
      )}
      <Boton titulo="Adjuntar foto" secundario onPress={() => router.push('/reporte/foto')} />

      <Text style={estilos.label}>Ubicación</Text>
      <Text style={estilos.gris}>{textoUbicacion(borrador.ubicacion)}</Text>
      <Boton titulo="Marcar ubicación" secundario onPress={() => router.push('/reporte/ubicacion')} />

      {error ? <Text style={estilos.error}>{error}</Text> : null}
      <Boton titulo="Guardar reporte" onPress={guardar} />
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  pantalla: { padding: 16, paddingBottom: 40 },
  label: { fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoria: { borderWidth: 1, borderColor: '#1f5fa8', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 },
  categoriaElegida: { backgroundColor: '#1f5fa8' },
  foto: { width: 120, height: 120, borderRadius: 6 },
  gris: { color: '#666' },
  error: { color: '#b91c1c', marginTop: 10 },
});
