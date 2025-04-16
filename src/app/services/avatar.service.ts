import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  private totalAvatares = 10;

  generarAvatarAleatorio(): string {
    const numero = Math.floor(Math.random() * this.totalAvatares) + 1;
    return `assets/avatars/logo${numero}.jpg`;
  }
}
