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
    const usuario = this.obtenerUsuarioDesdeLocalStorage();
    this.modo = usuario?.modo || '';
    this.cartaSeleccionada = usuario?.carta ?? null;
  }

  elegirCarta(carta: number): void {
    const usuario = this.obtenerUsuarioDesdeLocalStorage();

    if (!usuario || usuario.modo !== 'jugador') {
      return;
    }

    usuario.carta = carta;
    usuario.cartaSeleccionada = true;
    localStorage.setItem('usuarioAdministrador', JSON.stringify(usuario));

    // Emite evento local y simula un cambio en el almacenamiento para otras pestañas
    this.cartaSeleccionada = carta;
    this.cartaSeleccionadaEvent.emit();
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'usuarioAdministrador',
      newValue: JSON.stringify(usuario)
    }));
  }

  esJugador(): boolean {
    return this.modo === 'jugador';
  }

  private obtenerUsuarioDesdeLocalStorage(): any {
    try {
      return JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');
    } catch {
      return {};
    }
  }
}
