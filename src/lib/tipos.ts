export type Categoria = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';

export type EstadoReporte = 'pendiente' | 'en curso' | 'resuelto';

// la ubicación puede venir del GPS o elegida a mano (si no hay permiso)
export type Ubicacion =
  | { tipo: 'gps'; latitud: number; longitud: number; aproximada: boolean }
  | { tipo: 'sector'; sector: string };

export type Reporte = {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  fotoUri: string | null;
  notaVozUri: string | null;
  ubicacion: Ubicacion | null;
  estado: EstadoReporte;
  fecha: string;
};

// lo que se va completando en el formulario antes de guardar
export type Borrador = Omit<Reporte, 'id' | 'estado' | 'fecha'>;

export type Aviso = {
  id: string;
  titulo: string;
  mensaje: string;
  fecha: string;
};
