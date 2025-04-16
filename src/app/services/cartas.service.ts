import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CartasService {

  constructor() {}

  obtenerCartas(): number[] {
    // Aquí simulas una llamada backend: se puede cambiar luego por un HTTP
    return [1, 2, 3, 5, 8, 13, 21];
  }
}
