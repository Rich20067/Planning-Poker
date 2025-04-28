// src/app/services/jugador.service.ts
import { Injectable } from '@angular/core';

export interface Jugador {
  nombre: string;
  modo: 'jugador' | 'espectador';
  avatar: string;
  cartaElegida?: string;
}

@Injectable({
  providedIn: 'root'
})
export class JugadorService {

  private getClave(nombrePartida: string): string {
    return `jugadores_${nombrePartida}`;
  }

  guardarJugador(jugador: Jugador, nombrePartida: string): void {
    const clave = this.getClave(nombrePartida);
    const jugadores = this.obtenerJugadores(nombrePartida);
    jugadores.push(jugador);
    localStorage.setItem(clave, JSON.stringify(jugadores));
  }

  obtenerJugadores(nombrePartida: string): Jugador[] {
    const clave = this.getClave(nombrePartida);
    return JSON.parse(localStorage.getItem(clave) || '[]');
  }

  limpiarJugadores(nombrePartida: string): void {
    localStorage.removeItem(this.getClave(nombrePartida));
  }
}
