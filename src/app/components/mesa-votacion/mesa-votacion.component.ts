import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ElegirCartaComponent } from '../elegir-carta/elegir-carta.component';
import { AvatarService } from '../../services/avatar.service';
import { LinkService } from '../../services/link.service';
import { UnirsePartidaComponent } from '../unirse-partida/unirse-partida.component';

@Component({
  selector: 'app-mesa-votacion',
  standalone: true,
  imports: [CommonModule, ElegirCartaComponent, UnirsePartidaComponent],
  templateUrl: './mesa-votacion.component.html',
  styleUrls: ['./mesa-votacion.component.css']
})
export class MesaVotacionComponent implements OnInit, OnDestroy {
  nombrePartida: string = '';
  jugadores: any[] = [];
  usuarioAdministrador: any;
  usuarioActual: any;
  cartasDisponibles: number[] = [];
  cartasReveladas: boolean = false;
  votosPorCarta: { [carta: number]: number } = {};
  promedioVotos: number = 0;
  cartasConVotos: number[] = [];
  mostrarUnirseOverlay = false;
  linkDeInvitacion: string = '';
  esAdministrador: boolean = false;
  esEspectador: boolean = false; // Nueva propiedad para identificar si es espectador

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private avatarService: AvatarService,
    private linkService: LinkService
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
  
      const storageKey = `jugadores_${this.nombrePartida}`;
      const jugadoresPartida = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
      const usuarioAdminGuardado = localStorage.getItem('usuarioAdministrador');
      this.usuarioAdministrador = usuarioAdminGuardado ? JSON.parse(usuarioAdminGuardado) : null;
  
      const usuarioActualGuardado = localStorage.getItem('usuarioActual');
      this.usuarioActual = usuarioActualGuardado ? JSON.parse(usuarioActualGuardado) : null;
  
      // 🔥 Determinar si el usuario actual es el administrador
      this.esAdministrador = !!(this.usuarioAdministrador && this.usuarioActual && this.usuarioAdministrador.nombre === this.usuarioActual.nombre);
  
      // 🔥 Determinar si el usuario actual es espectador
      this.esEspectador = this.usuarioActual?.modo === 'espectador';
  
      // 🔥 Si es el administrador (modo jugador o modo espectador), podrá ver los botones
      // (Nada más hay que usar en HTML: *ngIf="esAdministrador")
  
      if (esInvitado || (!usuarioAdminGuardado && jugadoresPartida.length === 0)) {
        this.mostrarUnirseOverlay = true;
      } else {
        this.cargarJugadores();
         
  if (this.esEspectador) {
    this.cartasReveladas = true; // Los espectadores verán las cartas reveladas, pero no podrán elegir cartas
  }
      }
      
  
      this.cartasReveladas = localStorage.getItem('cartasReveladas') === 'true';
    });
  
    window.addEventListener('storage', this.onStorageChange.bind(this));
  }
  
  ngOnDestroy(): void {
    window.removeEventListener('storage', this.onStorageChange.bind(this));
  }

  obtenerCartasDesdeLocalStorage(): number[] {
    const cartasGuardadas = localStorage.getItem('poolCartas');
    return cartasGuardadas ? JSON.parse(cartasGuardadas) : [1, 2, 3, 5, 8, 13, 21];
  }

  cargarJugadores(): void {
    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadoresAlmacenados = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const jugadoresConAvatares = jugadoresAlmacenados.map((jugador: any) => {
      if (!jugador.avatarUrl) {
        jugador.avatarUrl = this.avatarService.generarAvatarAleatorio();
      }
      return jugador;
    });

    // ⚡️ Incluir también al administrador en la lista
    this.jugadores = [
      ...(this.usuarioAdministrador ? [this.usuarioAdministrador] : []),
      ...jugadoresConAvatares
    ];

    this.contarVotos();
    this.calcularPromedio();
    this.actualizarCartasConVotos();
  }

  contarVotos(): void {
    this.votosPorCarta = {};
    this.jugadores.forEach(jugador => {
      if (jugador.carta !== undefined && jugador.carta !== null && jugador.modo !== 'espectador') {
        this.votosPorCarta[jugador.carta] = (this.votosPorCarta[jugador.carta] || 0) + 1;
      }
    });
  }

  calcularPromedio(): void {
    let suma = 0;
    let cantidad = 0;

    this.jugadores.forEach(jugador => {
      if (jugador.carta !== undefined && jugador.carta !== null && jugador.modo !== 'espectador') {
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
    if (this.esAdministrador || this.esEspectador) { // Mostrar opción tanto en jugador como en espectador
      this.cartasReveladas = true;
      localStorage.setItem('cartasReveladas', 'true');
      this.contarVotos();
      this.calcularPromedio();
      this.actualizarCartasConVotos();
    }
  }

  cerrarRevelacion(): void {
    if (this.esAdministrador || this.esEspectador) { // Mostrar opción tanto en jugador como en espectador
      this.cartasReveladas = false;
      localStorage.removeItem('cartasReveladas');
    }
  }

  siguienteRonda(): void {
    if (this.esAdministrador || this.esEspectador) { // Mostrar opción tanto en jugador como en espectador
      const storageKey = `jugadores_${this.nombrePartida}`;
      const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');

      jugadores.forEach((jugador: any) => {
        jugador.carta = null;
      });

      localStorage.setItem(storageKey, JSON.stringify(jugadores));
      if (this.usuarioAdministrador) {
        this.usuarioAdministrador.carta = null;
        localStorage.setItem('usuarioAdministrador', JSON.stringify(this.usuarioAdministrador));
      }

      this.cartasReveladas = false;
      localStorage.removeItem('cartasReveladas');
      this.cargarJugadores();
    }
  }

  copiarAlPortapapeles(): void {
    navigator.clipboard.writeText(this.linkDeInvitacion).then(() => {
      alert('¡Link copiado al portapapeles!');
    });
  }

  cerrarOverlay(): void {
    this.mostrarUnirseOverlay = false;
    this.cargarJugadores();
  }

  private onStorageChange(event: StorageEvent): void {
    if (event.key?.startsWith('jugadores_') || event.key === 'usuarioAdministrador' || event.key === 'cartasReveladas') {
      this.cargarJugadores();
      this.cartasReveladas = localStorage.getItem('cartasReveladas') === 'true';
    }
  }
}
