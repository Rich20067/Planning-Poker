import { Component, OnInit } from '@angular/core';

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
export class MesaVotacionComponent implements OnInit {
  nombrePartida: string = '';
  jugadores: any[] = [];
  usuarioAdministrador: any;
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
      const usuarioAdmin = localStorage.getItem('usuarioAdministrador');
      const adminGuardado = localStorage.getItem(`usuarioAdministrador_${this.nombrePartida}`);

      if (esInvitado || (!usuarioAdmin && jugadoresPartida.length === 0)) {
        this.mostrarUnirseOverlay = true;
      } else {
        this.cargarJugadores();
      }
    });
  }

  obtenerCartasDesdeLocalStorage(): number[] {
    const cartasGuardadas = localStorage.getItem('poolCartas');
    return cartasGuardadas ? JSON.parse(cartasGuardadas) : [1, 2, 3, 5, 8, 13, 21];
  }

  cargarJugadores(): void {
    this.usuarioAdministrador = this.obtenerUsuarioAdministrador();
  
    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadoresAlmacenados = JSON.parse(localStorage.getItem(storageKey) || '[]');
  
    const jugadoresConAvatares = jugadoresAlmacenados.map((jugador: any) => {
      if (!jugador.avatarUrl) {
        jugador.avatarUrl = this.avatarService.generarAvatarAleatorio();
      }
      return jugador;
    });
  
    this.jugadores = [this.usuarioAdministrador, ...jugadoresConAvatares];
  
    this.contarVotos();
    this.calcularPromedio();
    this.actualizarCartasConVotos();
  }

  obtenerUsuarioAdministrador(): any {
    const adminGuardado = localStorage.getItem('usuarioAdministrador');
    return adminGuardado ? JSON.parse(adminGuardado) : null;
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
    this.cartasReveladas = true;
    this.contarVotos();
    this.calcularPromedio();
    this.actualizarCartasConVotos();
  }

  cerrarRevelacion(): void {
    this.cartasReveladas = false;
  }

  siguienteRonda(): void {
    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');

    jugadores.forEach((jugador: any) => {
      jugador.carta = null;
    });

    localStorage.setItem(storageKey, JSON.stringify(jugadores));
    this.usuarioAdministrador.carta = null;
    localStorage.setItem('usuarioAdministrador', JSON.stringify(this.usuarioAdministrador));

    this.cartasReveladas = false;
    this.cargarJugadores();
  }

  copiarAlPortapapeles(): void {
    navigator.clipboard.writeText(this.linkDeInvitacion).then(() => {
      alert('¡Link copiado al portapapeles!');
    });
  }

  cerrarOverlay() {
    this.mostrarUnirseOverlay = false;
    this.cargarJugadores(); // Recargamos los jugadores en la mesa
  }
}
