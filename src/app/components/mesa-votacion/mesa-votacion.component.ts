import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ElegirCartaComponent } from '../elegir-carta/elegir-carta.component';
import { LinkService } from '../../services/link.service';
import { UnirsePartidaComponent } from '../unirse-partida/unirse-partida.component';
import { CrearUsuarioAdministradorComponent } from '../crear-usuario-administrador/crear-usuario-administrador.component';

@Component({
  selector: 'app-mesa-votacion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ElegirCartaComponent,
    UnirsePartidaComponent,
    CrearUsuarioAdministradorComponent
  ],
  templateUrl: './mesa-votacion.component.html',
  styleUrls: ['./mesa-votacion.component.css'],
})
export class MesaVotacionComponent implements OnInit, OnDestroy {
  nombrePartida: string = '';
  jugadores: any[] = [];
  usuarioAdministrador: any;
  mostrarModalInvitacion: boolean = false;
  mensajeCopiado: boolean = false;
  usuarioActual: any;
  esAdministrador: boolean = false;
  cartasDisponibles: (number | string)[] = [];
  cartasReveladas: boolean = false;
  mostrandoCarga: boolean = false;
  votosPorCarta: { [carta: string]: number } = {};
  promedioVotos: number | null = null;
  cartasConVotos: (string | number)[] = [];
  mostrarUnirseOverlay = false;
  linkDeInvitacion: string = '';
  mostrarModalModo = false;
  modoTemporal: string = '';
  mostrarModalPuntaje: boolean = false;
modoTemporalPuntaje: any = null;
mostrarCrearAdminOverlay = false;


  modosDePuntaje = [
    { nombre: 'Fibonacci', valores: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, '?', '☕'] },
    { nombre: 'Camisetas', valores: ['XS', 'S', 'M', 'L', 'XL', '?', '☕'] },
    { nombre: 'Secuencia lineal', valores: [1, 2, 3, 4, 5, 6, 7 ,8, 9, '?', '☕'] },
    { nombre: 'Potencias de Dos', valores: [2, 4, 6, 8, 12, 16, 32, 64, '?','☕'] },
  ];
  modoSeleccionado = this.modosDePuntaje[0];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private linkService: LinkService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const modoGuardado = localStorage.getItem('modoPuntajeSeleccionado');
    this.modoSeleccionado = modoGuardado
      ? JSON.parse(modoGuardado)
      : this.modosDePuntaje[0];

    this.cartasDisponibles = this.modoSeleccionado.valores;

    this.route.queryParams.subscribe((params) => {
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
      const usuarioYaRegistrado = jugadores.some(
        (j: any) => j.nombre === this.usuarioActual?.nombre
      );

      this.mostrarUnirseOverlay =
        esInvitado || !this.usuarioActual || !usuarioYaRegistrado;
      if (!this.mostrarUnirseOverlay) {
        this.cargarJugadores();
      }
    });

    window.addEventListener('storage', this.onStorageChange.bind(this));

    const reveladas = localStorage.getItem(
      `cartasReveladas_${this.nombrePartida}`
    );
    this.cartasReveladas = reveladas === 'true';
  }

  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorageChange.bind(this));
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

    this.cdr.detectChanges();
    window.dispatchEvent(new StorageEvent('storage', { key: 'usuarioActual' }));
  }
  abrirModalModo(): void {
    this.modoTemporal = this.usuarioActual?.modo;
    this.mostrarModalModo = true;
  }
  aceptarCambioModo(): void {
    this.cambiarModo(this.modoTemporal);
    this.mostrarModalModo = false;
  }
  
  cerrarModalModo(): void {
    this.mostrarModalModo = false;
    this.modoTemporal = this.usuarioActual?.modo; // vuelve a dejarlo como estaba
  }
  
  alternarModo(): void {
    if (!this.usuarioActual) return;
    const nuevoModo =
      this.usuarioActual.modo === 'jugador' ? 'espectador' : 'jugador';
    this.cambiarModo(nuevoModo);
  }

  cargarJugadores(): void {
    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadoresAlmacenados = JSON.parse(
      localStorage.getItem(storageKey) || '[]'
    );

    const jugadoresConCartas = jugadoresAlmacenados.map((jugador: any) => {
      const claveUsuario = `usuario_${jugador.nombre}`;
      const datosActualizados = localStorage.getItem(claveUsuario);
      const datos = datosActualizados ? JSON.parse(datosActualizados) : jugador;
      const carta = localStorage.getItem(`carta-${jugador.nombre}`);
      datos.carta = carta ?? null;
      return datos;
    });

    this.jugadores = jugadoresConCartas;

    const admin = this.obtenerUsuarioAdministrador();
    if (admin) {
      const cartaAdmin = localStorage.getItem(`carta-${admin.nombre}`);
      admin.carta = cartaAdmin ?? null;
      const yaExiste = this.jugadores.find((j) => j.nombre === admin.nombre);
      if (!yaExiste) {
        this.jugadores.unshift(admin);
      } else {
        this.jugadores = this.jugadores.map((j) =>
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
    admin.carta = carta ?? null;
    const index = this.jugadores.findIndex((j) => j.nombre === admin.nombre);
    if (index !== -1) {
      this.jugadores[index].carta = admin.carta;
    } else {
      this.jugadores.unshift(admin);
    }
  }
  abrirModalPuntaje(): void {
    this.modoTemporalPuntaje = this.modoSeleccionado;
    this.mostrarModalPuntaje = true;
  }
  
  cerrarModalPuntaje(): void {
    this.mostrarModalPuntaje = false;
  }
  
  aceptarCambioPuntaje(): void {
    if (
      this.modoTemporalPuntaje &&
      this.modoTemporalPuntaje.nombre !== this.modoSeleccionado.nombre
    ) {
      this.modoSeleccionado = this.modoTemporalPuntaje;
      this.cambiarModoDePuntaje();
    }
    this.cerrarModalPuntaje();
  }
  contarVotos(): void {
    this.votosPorCarta = {};
    this.jugadores.forEach((jugador) => {
      if (jugador && jugador.carta != null && jugador.modo !== 'espectador') {
        const clave = jugador.carta.toString();
        this.votosPorCarta[clave] = (this.votosPorCarta[clave] || 0) + 1;
      }
    });
  }

  calcularPromedio(): void {
    let suma = 0;
    let cantidad = 0;

    this.jugadores.forEach((jugador) => {
      const valor = Number(jugador.carta);
      if (
        jugador &&
        jugador.carta !== undefined &&
        jugador.carta !== null &&
        !isNaN(valor) &&
        jugador.modo !== 'espectador'
      ) {
        suma += valor;
        cantidad++;
      }
    });

    this.promedioVotos = cantidad > 0 ? Math.round(suma / cantidad) : null;
  }

  actualizarCartasConVotos(): void {
    this.cartasConVotos = Object.keys(this.votosPorCarta);
  }

  cambiarModoDePuntaje(): void {
    if (!this.esAdministrador || this.cartasReveladas) return;
    this.cartasDisponibles = this.modoSeleccionado.valores;
    localStorage.setItem(
      'modoPuntajeSeleccionado',
      JSON.stringify(this.modoSeleccionado)
    );

    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');
    jugadores.forEach((j: any) => {
      localStorage.removeItem(`carta-${j.nombre}`);
      j.carta = null;
    });
    localStorage.setItem(storageKey, JSON.stringify(jugadores));

    if (this.usuarioAdministrador) {
      localStorage.removeItem(`carta-${this.usuarioAdministrador.nombre}`);
    }

    this.cargarJugadores();
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'modoPuntajeSeleccionado' })
    );
  }

  revelarCartas(): void {
    if (!this.esAdministrador) return;
  
    this.mostrandoCarga = true;
  
    setTimeout(() => {
      this.cartasReveladas = true;
      this.mostrandoCarga = false;
      localStorage.setItem(`cartasReveladas_${this.nombrePartida}`, 'true');
      this.contarVotos();
      this.calcularPromedio();
      this.actualizarCartasConVotos();
    }, 2500);
  }
  getCartaSeleccionadaActual(): string | null {
    const clave = `carta-${this.usuarioActual?.nombre}`;
    return localStorage.getItem(clave);
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

  abrirModalInvitacion(): void {
    this.mostrarModalInvitacion = true;
  }
  
  cerrarModalInvitacion(): void {
    this.mostrarModalInvitacion = false;
  }
  
  copiarAlPortapapeles(): void {
    navigator.clipboard.writeText(this.linkDeInvitacion).then(() => {
      this.mensajeCopiado = true;
      setTimeout(() => {
        this.mensajeCopiado = false;
      }, 3000); // Se oculta después de 3 segundos
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
      event.key === `cartasReveladas_${this.nombrePartida}` ||
      event.key === 'modoPuntajeSeleccionado'
    ) {
      this.usuarioAdministrador = this.obtenerUsuarioAdministrador();
      const nombreSesion = sessionStorage.getItem('usuarioEnSesion');
      const actualEnSesion = nombreSesion
        ? JSON.parse(localStorage.getItem(`usuario_${nombreSesion}`) || 'null')
        : null;

      this.usuarioActual = actualEnSesion || this.obtenerUsuarioActual();
      this.validarAdministrador();

      const modoGuardado = localStorage.getItem('modoPuntajeSeleccionado');
      this.modoSeleccionado = modoGuardado
        ? JSON.parse(modoGuardado)
        : this.modosDePuntaje[0];
      this.cartasDisponibles = this.modoSeleccionado.valores;

      this.cargarJugadores();
      const reveladas = localStorage.getItem(
        `cartasReveladas_${this.nombrePartida}`
      );
      this.cartasReveladas = reveladas === 'true';

      this.cdr.detectChanges();
    }
  }

  asignarAdministrador(jugador: any): void {
    if (
      !this.esAdministrador ||
      jugador.nombre === this.usuarioAdministrador?.nombre
    )
      return;
    const confirmar = confirm(
      `¿Deseas asignar a ${jugador.nombre} como nuevo administrador?`
    );
    if (!confirmar) return;

    localStorage.setItem('usuarioAdministrador', JSON.stringify(jugador));
    this.usuarioAdministrador = jugador;
    this.validarAdministrador();
    this.cargarJugadores();
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'usuarioAdministrador' })
    );
  }
}
