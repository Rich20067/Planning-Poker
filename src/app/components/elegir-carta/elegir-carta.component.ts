import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-elegir-carta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './elegir-carta.component.html',
  styleUrls: ['./elegir-carta.component.css']
})
export class ElegirCartaComponent implements OnInit, OnDestroy {
  @Input() cartas: number[] = [];
  @Output() cartaSeleccionadaEvent = new EventEmitter<void>();

  cartaSeleccionada: number | null = null;
  usuarioActual: any = {};
  modo: string = '';
  nombre: string = '';

  ngOnInit(): void {
    this.actualizarDatosDesdeStorage();
    window.addEventListener('storage', this.actualizarDatosDesdeStorage.bind(this));
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.actualizarDatosDesdeStorage.bind(this));
  }

  elegirCarta(carta: number): void {
    if (!this.usuarioActual || !this.nombre) return;

    const esAdmin = this.esAdministrador();

    // Solo puede elegir carta si es jugador o si es administrador
    if (this.modo !== 'jugador') return;


    this.cartaSeleccionada = carta;
    const claveCarta = this.obtenerClaveUsuario();
    localStorage.setItem(claveCarta, carta.toString());

    this.cartaSeleccionadaEvent.emit();

    window.dispatchEvent(new StorageEvent('storage', {
      key: claveCarta,
      newValue: carta.toString()
    }));
  }

  private obtenerClaveUsuario(): string {
    return `carta-${this.nombre}`;
  }

  private obtenerUsuarioActual(): any {
    try {
      return JSON.parse(localStorage.getItem('usuarioActual') || '{}');
    } catch {
      return {};
    }
  }

  private actualizarDatosDesdeStorage(): void {
    this.usuarioActual = this.obtenerUsuarioActual();
    this.modo = this.usuarioActual?.modo || '';
    this.nombre = this.usuarioActual?.nombre || '';

    // Si es administrador y su modo no está en 'jugador', lo forzamos a 'jugador'
    const esAdmin = this.esAdministrador();
    if (esAdmin && this.modo !== 'jugador') {
      this.modo = 'jugador';
    }

    const claveCarta = this.obtenerClaveUsuario();
    const cartaGuardada = localStorage.getItem(claveCarta);
    this.cartaSeleccionada = cartaGuardada ? parseInt(cartaGuardada, 10) : null;
  }

  esAdministrador(): boolean {
    const adminGuardado = localStorage.getItem('usuarioAdministrador');
    return adminGuardado 
      ? JSON.parse(adminGuardado).nombre?.trim() === this.nombre?.trim()
      : false;
  }
}
