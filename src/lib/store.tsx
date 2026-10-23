import { createContext, ReactNode, useContext, useState } from 'react';
import { Aviso, Borrador, EstadoReporte, Reporte } from './tipos';

const borradorVacio: Borrador = {
  titulo: '',
  descripcion: '',
  aula: '',
  categoria: 'electricidad',
  fotoUri: null,
  notaVozUri: null,
  ubicacion: null,
};

type DatosApp = {
  reportes: Reporte[];
  borrador: Borrador;
  avisos: Aviso[];
  quiereAvisos: boolean;
  cambiarBorrador: (cambios: Partial<Borrador>) => void;
  guardarReporte: () => Reporte;
  cambiarEstado: (id: string, estado: EstadoReporte) => void;
  agregarAviso: (titulo: string, mensaje: string) => void;
  setQuiereAvisos: (valor: boolean) => void;
};

const AppContext = createContext<DatosApp | null>(null);

// Los datos se guardan en memoria (alcanza para el TP, no hay backend)
export function AppProvider({ children }: { children: ReactNode }) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [borrador, setBorrador] = useState<Borrador>(borradorVacio);
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [quiereAvisos, setQuiereAvisos] = useState(false);

  function cambiarBorrador(cambios: Partial<Borrador>) {
    setBorrador((actual) => ({ ...actual, ...cambios }));
  }

  function guardarReporte() {
    const nuevo: Reporte = {
      ...borrador,
      id: String(Date.now()),
      estado: 'pendiente',
      fecha: new Date().toLocaleString(),
    };
    setReportes((lista) => [nuevo, ...lista]);
    setBorrador(borradorVacio);
    return nuevo;
  }

  function cambiarEstado(id: string, estado: EstadoReporte) {
    setReportes((lista) => lista.map((r) => (r.id === id ? { ...r, estado } : r)));
  }

  function agregarAviso(titulo: string, mensaje: string) {
    const aviso: Aviso = { id: String(Date.now()), titulo, mensaje, fecha: new Date().toLocaleString() };
    setAvisos((lista) => [aviso, ...lista]);
  }

  return (
    <AppContext.Provider
      value={{
        reportes,
        borrador,
        avisos,
        quiereAvisos,
        cambiarBorrador,
        guardarReporte,
        cambiarEstado,
        agregarAviso,
        setQuiereAvisos,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const datos = useContext(AppContext);
  if (!datos) throw new Error('useApp se tiene que usar adentro de AppProvider');
  return datos;
}
