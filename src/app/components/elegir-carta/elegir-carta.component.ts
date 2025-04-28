import { Component, Input, Output, EventEmitter, DoCheck } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elegir-carta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elegir-carta.component.html',
  styleUrls: ['./elegir-carta.component.css']
})
export class ElegirCartaComponent implements DoCheck {
  @Input() cartas: number[] = [];
  @Output() cartaSeleccionadaEvent = new EventEmitter<void>();

  cartaSeleccionada: number | null = null;
  modo: string = '';

  ngDoCheck(): void {
    const usuario = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');
    this.modo = usuario?.modo || '';
  }

  elegirCarta(carta: number): void {
    const usuario = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');

    if (!usuario || usuario.modo !== 'jugador') {
      return;
    }

    usuario.carta = carta;
    usuario.cartaSeleccionada = true;
    localStorage.setItem('usuarioAdministrador', JSON.stringify(usuario));

    this.cartaSeleccionada = carta;
    this.cartaSeleccionadaEvent.emit();
  }

  esJugador(): boolean {
    return this.modo === 'jugador';
  }
}
