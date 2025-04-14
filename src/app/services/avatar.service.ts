import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  generarAvatarAleatorio(): string {
    const totalAvatares = 10;
    const numero = Math.floor(Math.random() * totalAvatares) + 1;
    return `assets/avatars/logo${numero}.jpg`;
  }
}
