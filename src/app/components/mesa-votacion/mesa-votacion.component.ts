import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ElegirCartaComponent } from '../elegir-carta/elegir-carta.component';
import { AvatarService } from '../../services/avatar.service';
import { LinkService } from '../../services/link.service';
import { UnirsePartidaComponent } from '../unirse-partida/unirse-partida.component';

@Component({
  selector: 'app-mesa-votacion',
  standalone: true,
  imports: [CommonModule, FormsModule, ElegirCartaComponent, UnirsePartidaComponent],
  templateUrl: './mesa-votacion.component.html',
  styleUrls: ['./mesa-votacion.component.css']
})
export class MesaVotacionComponent implements OnInit, OnDestroy {
  nombrePartida: string = '';
  jugadores: any[] = [];
  usuarioAdministrador: any;
  usuarioActual: any;
  esAdministrador: boolean = false;
  cartasDisponibles: number[] = [];
  cartasReveladas: boolean = false;
  votosPorCarta: { [carta: number]: number } = {};
  promedioVotos: number = 0;
  cartasConVotos: number[] = [];
  mostrarUnirseOverlay = false;
  linkDeInvitacion: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private avatarService: AvatarService,
    private linkService: LinkService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cartasDisponibles = this.obtenerCartasDesdeLocalStorage();

    this.route.queryParams.subscribe(params => {
      const esInvitado = params['invitado'] === 'true';
      const nombrePartidaParam = params['nombrePartida'];

      if (nombrePartidaParam) {
        this.nombrePartida = nombrePartidaParam;
        localStorage.setItem('nombrePartida', this.nombrePartida);
      } else {
        this.nombrePartida = localStorage.getItem('nombrePartida') || '';
      }

      this.linkDeInvitacion = this.linkService.generarLink(this.nombrePartida);

      this.usuarioAdministrador = this.obtenerUsuarioAdministrador();
      this.usuarioActual = this.obtenerUsuarioActual();
      this.validarAdministrador();

      const storageKey = `jugadores_${this.nombrePartida}`;
      const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const usuarioYaRegistrado = jugadores.some((j: any) => j.nombre === this.usuarioActual?.nombre);

      if (esInvitado || !this.usuarioActual || !usuarioYaRegistrado) {
        this.mostrarUnirseOverlay = true;
      } else {
        this.mostrarUnirseOverlay = false;
        this.cargarJugadores();
      }
    });

    window.addEventListener('storage', this.onStorageChange.bind(this));

    const reveladas = localStorage.getItem(`cartasReveladas_${this.nombrePartida}`);
    this.cartasReveladas = reveladas === 'true';
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorageChange.bind(this));
  }

  obtenerCartasDesdeLocalStorage(): number[] {
    const cartasGuardadas = localStorage.getItem('poolCartas');
    return cartasGuardadas ? JSON.parse(cartasGuardadas) : [1, 2, 3, 5, 8, 13, 21];
  }

  obtenerUsuarioAdministrador(): any {
    const adminGuardado = localStorage.getItem('usuarioAdministrador');
    return adminGuardado ? JSON.parse(adminGuardado) : null;
  }

  obtenerUsuarioActual(): any {
    const actualGuardado = localStorage.getItem('usuarioActual');
    return actualGuardado ? JSON.parse(actualGuardado) : null;
  }

  validarAdministrador(): void {
    const actual = this.usuarioActual?.nombre?.trim();
    const admin = this.usuarioAdministrador?.nombre?.trim();
    this.esAdministrador = actual && admin && actual === admin;
  }

  esJugador(): boolean {
    return this.usuarioActual?.modo === 'jugador' || this.esAdministrador;
  }

  cambiarModo(nuevoModo: string): void {
    if (!this.usuarioActual || !nuevoModo) return;

    const nombre = this.usuarioActual.nombre;
    const claveUsuario = `usuario_${nombre}`;
    const data = localStorage.getItem(claveUsuario);
    if (!data) return;

    const actualizado = JSON.parse(data);
    actualizado.modo = nuevoModo;

    localStorage.setItem(claveUsuario, JSON.stringify(actualizado));
    localStorage.setItem('usuarioActual', JSON.stringify(actualizado));
    localStorage.setItem('usuarioEnSesion', nombre);

    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const index = jugadores.findIndex((j: any) => j.nombre === nombre);
    if (index !== -1) {
      jugadores[index].modo = nuevoModo;
    } else {
      jugadores.push(actualizado);
    }
    localStorage.setItem(storageKey, JSON.stringify(jugadores));

    this.usuarioActual = actualizado;
    this.validarAdministrador();
    this.cargarJugadores();

    this.jugadores = [...this.jugadores];
    this.cdr.detectChanges();

    window.dispatchEvent(new StorageEvent('storage', { key: 'usuarioActual' }));
  }

  alternarModo(): void {
    if (!this.usuarioActual) return;
    const nuevoModo = this.usuarioActual.modo === 'jugador' ? 'espectador' : 'jugador';
    this.cambiarModo(nuevoModo);
  }

  cargarJugadores(): void {
    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadoresAlmacenados = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
    const jugadoresConCartas = jugadoresAlmacenados.map((jugador: any) => {
      const claveUsuario = `usuario_${jugador.nombre}`;
      const datosActualizados = localStorage.getItem(claveUsuario);
      const datos = datosActualizados ? JSON.parse(datosActualizados) : jugador;
  
      const carta = localStorage.getItem(`carta-${jugador.nombre}`);
      datos.carta = carta ? parseInt(carta, 10) : null;
  
      if (!datos.avatarUrl) {
        datos.avatarUrl = this.avatarService.generarAvatarAleatorio();
      }
  
      return datos;
    });
  
    this.jugadores = jugadoresConCartas;
  
    // ✅ Garantizar que el administrador esté incluido con su carta
    const admin = this.obtenerUsuarioAdministrador();
    if (admin) {
      const cartaAdmin = localStorage.getItem(`carta-${admin.nombre}`);
      admin.carta = cartaAdmin ? parseInt(cartaAdmin, 10) : null;
  
      const yaExiste = this.jugadores.find(j => j.nombre === admin.nombre);
      if (!yaExiste) {
        this.jugadores.unshift(admin);
      } else {
        // 🔁 Si ya existe, actualizar su carta sin sobrescribir
        this.jugadores = this.jugadores.map(j =>
          j.nombre === admin.nombre ? { ...j, carta: admin.carta } : j
        );
      }
    }
  
    this.actualizarEstadoAdministrador();
    this.contarVotos();
    this.calcularPromedio();
    this.actualizarCartasConVotos();
  }
  
  actualizarEstadoAdministrador(): void {
    const admin = this.obtenerUsuarioAdministrador();
    if (!admin) return;
  
    const carta = localStorage.getItem(`carta-${admin.nombre}`);
    admin.carta = carta ? parseInt(carta, 10) : null;
  
    const index = this.jugadores.findIndex(j => j.nombre === admin.nombre);
    if (index !== -1) {
      this.jugadores[index].carta = admin.carta;
    } else {
      this.jugadores.unshift(admin);
    }
  }
  
  

  contarVotos(): void {
    this.votosPorCarta = {};
    this.jugadores.forEach(jugador => {
      if (jugador && jugador.carta !== undefined && jugador.carta !== null && jugador.modo !== 'espectador') {
        this.votosPorCarta[jugador.carta] = (this.votosPorCarta[jugador.carta] || 0) + 1;
      }
    });
  }

  calcularPromedio(): void {
    let suma = 0;
    let cantidad = 0;

    this.jugadores.forEach(jugador => {
      if (jugador && jugador.carta !== undefined && jugador.carta !== null && jugador.modo !== 'espectador') {
        suma += jugador.carta;
        cantidad++;
      }
    });

    this.promedioVotos = cantidad > 0 ? Math.round(suma / cantidad) : 0;
  }

  actualizarCartasConVotos(): void {
    this.cartasConVotos = Object.keys(this.votosPorCarta)
      .map(Number)
      .sort((a, b) => a - b);
  }

  revelarCartas(): void {
    if (!this.esAdministrador) return;
    this.cartasReveladas = true;
    localStorage.setItem(`cartasReveladas_${this.nombrePartida}`, 'true');
    this.contarVotos();
    this.calcularPromedio();
    this.actualizarCartasConVotos();
  }

  cerrarRevelacion(): void {
    if (!this.esAdministrador) return;
    this.cartasReveladas = false;
    localStorage.setItem(`cartasReveladas_${this.nombrePartida}`, 'false');
  }

  siguienteRonda(): void {
    if (!this.esAdministrador) return;
    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');

    jugadores.forEach((jugador: any) => {
      localStorage.removeItem(`carta-${jugador.nombre}`);
      jugador.carta = null;
    });

    localStorage.setItem(storageKey, JSON.stringify(jugadores));

    if (this.usuarioAdministrador) {
      localStorage.removeItem(`carta-${this.usuarioAdministrador.nombre}`);
    }

    this.cartasReveladas = false;
    localStorage.setItem(`cartasReveladas_${this.nombrePartida}`, 'false');

    this.cargarJugadores();
  }

  copiarAlPortapapeles(): void {
    navigator.clipboard.writeText(this.linkDeInvitacion).then(() => {
      alert('¡Link copiado al portapapeles!');
    });
  }

  cerrarOverlay(): void {
    this.mostrarUnirseOverlay = false;
    this.usuarioActual = this.obtenerUsuarioActual();
    sessionStorage.setItem('usuarioEnSesion', this.usuarioActual.nombre);
    this.validarAdministrador();
    this.cargarJugadores();
  }

  private onStorageChange(event: StorageEvent): void {
    if (
      event.key?.startsWith('carta-') ||
      event.key === `jugadores_${this.nombrePartida}` ||
      event.key === 'usuarioAdministrador' ||
      event.key === 'usuarioActual' ||
      event.key === `cartasReveladas_${this.nombrePartida}`
    ) {
      this.usuarioAdministrador = this.obtenerUsuarioAdministrador();

      const previo = this.usuarioActual?.nombre;
      const recargado = this.obtenerUsuarioActual();
      if (recargado?.nombre === previo) {
        this.usuarioActual = recargado;
        this.validarAdministrador();
      }

      this.cargarJugadores();

      const reveladas = localStorage.getItem(`cartasReveladas_${this.nombrePartida}`);
      this.cartasReveladas = reveladas === 'true';
    }
  }
  asignarAdministrador(jugador: any): void {
    if (!this.esAdministrador) return;
    if (jugador.nombre === this.usuarioAdministrador?.nombre) return;
  
    const confirmar = confirm(`¿Deseas asignar a ${jugador.nombre} como nuevo administrador?`);
    if (!confirmar) return;
  
    localStorage.setItem('usuarioAdministrador', JSON.stringify(jugador));
    this.usuarioAdministrador = jugador;
    this.validarAdministrador();
    this.cargarJugadores();
  
    window.dispatchEvent(new StorageEvent('storage', { key: 'usuarioAdministrador' }));
  }
  
}