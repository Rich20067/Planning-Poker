import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElegirCartaComponent } from '../elegir-carta/elegir-carta.component';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-mesa-votacion',
  standalone: true,
  imports: [CommonModule, ElegirCartaComponent],
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

  constructor(
    private router: Router,
    private avatarService: AvatarService
  ) {}

  ngOnInit(): void {
    this.nombrePartida = localStorage.getItem('nombrePartida') || '';
    this.usuarioAdministrador = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');

    const cartasGuardadas = localStorage.getItem('poolCartas');
    this.cartasDisponibles = cartasGuardadas
      ? JSON.parse(cartasGuardadas)
      : [1, 2, 3, 5, 8, 13, 21];

    this.cargarJugadores();
  }

  cargarJugadores(): void {
    this.usuarioAdministrador = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');

    if (!this.usuarioAdministrador.avatarUrl) {
      this.usuarioAdministrador.avatarUrl = this.avatarService.generarAvatarAleatorio();
      localStorage.setItem('usuarioAdministrador', JSON.stringify(this.usuarioAdministrador));
    }

    const jugadoresAlmacenados = JSON.parse(localStorage.getItem('jugadores') || '[]');
    this.jugadores = [this.usuarioAdministrador, ...jugadoresAlmacenados];

    if (this.cartasReveladas) {
      this.contarVotos();
      this.calcularPromedio();
    }
  }

  siguienteRonda(): void {
    const usuario = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');

    if (usuario) {
      usuario.carta = null;
      usuario.cartaSeleccionada = false;
      localStorage.setItem('usuarioAdministrador', JSON.stringify(usuario));
    }

    this.cartasReveladas = false;
    this.votosPorCarta = {};
    this.promedioVotos = 0;
    this.cargarJugadores();
  }

  revelarCartas(): void {
    this.cartasReveladas = true;
    this.contarVotos();
    this.calcularPromedio();
  }

  contarVotos(): void {
    this.votosPorCarta = {};

    this.jugadores.forEach(j => {
      if (j.modo !== 'espectador' && j.carta !== null && j.carta !== undefined) {
        this.votosPorCarta[j.carta] = (this.votosPorCarta[j.carta] || 0) + 1;
      }
    });
  }

  calcularPromedio(): void {
    const votosNumericos = this.jugadores
      .filter(j => j.modo !== 'espectador' && typeof j.carta === 'number')
      .map(j => j.carta);

    const total = votosNumericos.reduce((a, b) => a + b, 0);
    this.promedioVotos = votosNumericos.length ? Math.round((total / votosNumericos.length) * 100) / 100 : 0;
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElegirCartaComponent } from '../elegir-carta/elegir-carta.component';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-mesa-votacion',
  standalone: true,
  imports: [CommonModule, ElegirCartaComponent],
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

  constructor(
    private router: Router,
    private avatarService: AvatarService
  ) {}

  ngOnInit(): void {
    this.nombrePartida = localStorage.getItem('nombrePartida') || '';
    this.usuarioAdministrador = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');

    const cartasGuardadas = localStorage.getItem('poolCartas');
    this.cartasDisponibles = cartasGuardadas
      ? JSON.parse(cartasGuardadas)
      : [1, 2, 3, 5, 8, 13, 21];

    this.cargarJugadores();
  }

  cargarJugadores(): void {
    this.usuarioAdministrador = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');

    if (!this.usuarioAdministrador.avatarUrl) {
      this.usuarioAdministrador.avatarUrl = this.avatarService.generarAvatarAleatorio();
      localStorage.setItem('usuarioAdministrador', JSON.stringify(this.usuarioAdministrador));
    }

    const jugadoresAlmacenados = JSON.parse(localStorage.getItem('jugadores') || '[]');
    this.jugadores = [this.usuarioAdministrador, ...jugadoresAlmacenados];

    if (this.cartasReveladas) {
      this.contarVotos();
      this.calcularPromedio();
    }
  }

  siguienteRonda(): void {
    const usuario = JSON.parse(localStorage.getItem('usuarioAdministrador') || '{}');

    if (usuario) {
      usuario.carta = null;
      usuario.cartaSeleccionada = false;
      localStorage.setItem('usuarioAdministrador', JSON.stringify(usuario));
    }

    this.cartasReveladas = false;
    this.votosPorCarta = {};
    this.promedioVotos = 0;
    this.cargarJugadores();
  }

  revelarCartas(): void {
    this.cartasReveladas = true;
    this.contarVotos();
    this.calcularPromedio();
  }

  contarVotos(): void {
    this.votosPorCarta = {};

    this.jugadores.forEach(j => {
      if (j.modo !== 'espectador' && j.carta !== null && j.carta !== undefined) {
        this.votosPorCarta[j.carta] = (this.votosPorCarta[j.carta] || 0) + 1;
      }
    });
  }

  calcularPromedio(): void {
    const votosNumericos = this.jugadores
      .filter(j => j.modo !== 'espectador' && typeof j.carta === 'number')
      .map(j => j.carta);

    const total = votosNumericos.reduce((a, b) => a + b, 0);
    this.promedioVotos = votosNumericos.length ? Math.round((total / votosNumericos.length) * 100) / 100 : 0;
  }
}
