import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PartidaService {
  private jugadores = ['Alice', 'Bob', 'Charlie'];

  obtenerJugadores(): string[] {
    return this.jugadores;
  }
}
