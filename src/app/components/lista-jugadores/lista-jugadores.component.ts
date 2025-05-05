import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PartidaService {

  obtenerJugadores(): any[] {
    const nombrePartida = localStorage.getItem('nombrePartida');
    const jugadores = JSON.parse(localStorage.getItem(`jugadores_${nombrePartida}`) || '[]');
    return jugadores; // Solo jugadores normales (no administrador aquí)
  }

  obtenerAdministrador(): any {
    return JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');
  }

  obtenerUsuarioActual(): any {
    return JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  }
}
