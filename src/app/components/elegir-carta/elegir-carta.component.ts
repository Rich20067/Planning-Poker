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
  @Input() cartas: (string | number)[] = [];

  @Output() cartaSeleccionadaEvent = new EventEmitter<string | number>();

  cartaSeleccionada: string | number | null = null;
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

  elegirCarta(carta: string | number): void {
    if (!this.usuarioActual || !this.nombre) return;

    if (!(this.modo === 'jugador' || this.esAdministrador())) return;

    this.cartaSeleccionada = carta;
    const claveCarta = this.obtenerClaveUsuario();
    localStorage.setItem(claveCarta, carta.toString());

    this.cartaSeleccionadaEvent.emit(carta);
  }

  private obtenerClaveUsuario(): string {
    return `carta-${this.nombre}`;
  }

  private obtenerUsuarioActual(): any {
    const nombreSesion = sessionStorage.getItem('usuarioEnSesion');
    if (nombreSesion) {
      const data = localStorage.getItem(`usuario_${nombreSesion}`);
      return data ? JSON.parse(data) : {};
    }

    return JSON.parse(localStorage.getItem('usuarioActual') || '{}');
  }

  private actualizarDatosDesdeStorage(): void {
    this.usuarioActual = this.obtenerUsuarioActual();
    this.nombre = this.usuarioActual?.nombre || '';

    const admin = localStorage.getItem('usuarioAdministrador');
    const adminObj = admin ? JSON.parse(admin) : null;
    const esAdmin = adminObj?.nombre?.trim() === this.nombre?.trim();

    this.modo = esAdmin ? 'jugador' : this.usuarioActual?.modo || '';

    const claveCarta = this.obtenerClaveUsuario();
    const cartaGuardada = localStorage.getItem(claveCarta);
    this.cartaSeleccionada = cartaGuardada ?? null;
  }

  esAdministrador(): boolean {
    const adminGuardado = localStorage.getItem('usuarioAdministrador');
    return adminGuardado 
      ? JSON.parse(adminGuardado).nombre?.trim() === this.nombre?.trim()
      : false;
  }
}
