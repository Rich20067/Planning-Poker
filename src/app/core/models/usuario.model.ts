export interface Usuario {
    nombre: string;
    rol: 'jugador' | 'espectador' | 'propietario';
    estado: 'activo' | 'inactivo';
  }
  