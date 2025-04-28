import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LinkService {

  constructor() { }

  generarLink(nombrePartida: string): string {
    const urlActual = window.location.origin;
    return `${urlActual}/mesa-votacion?nombrePartida=${encodeURIComponent(nombrePartida)}&invitado=true`;
  }
}
