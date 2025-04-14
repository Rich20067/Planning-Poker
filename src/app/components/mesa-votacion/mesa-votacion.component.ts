import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Jugador {
  nombre: string;
  carta?: string;
  modo: 'jugador' | 'espectador';
  avatar?: string;
}

interface UsuarioAdministrador {
  nombre: string;
  modo: 'jugador' | 'espectador';
  avatarUrl?: string;
}

@Component({
  selector: 'app-mesa-votacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mesa-votacion.component.html',
  styleUrls: ['./mesa-votacion.component.css']
})
export class MesaVotacionComponent implements OnInit {
  jugadores: Jugador[] = [];
  usuarioAdministrador: UsuarioAdministrador | null = null;
  nombrePartida: string = '';

  ngOnInit(): void {
    const adminData = localStorage.getItem('usuarioAdministrador');
    const jugadoresData = localStorage.getItem('jugadores');
    const partida = localStorage.getItem('nombrePartida');

    // Cargar datos del admin
    if (adminData) {
      const parsedAdmin: UsuarioAdministrador = JSON.parse(adminData);

      if (!parsedAdmin.avatarUrl) {
        parsedAdmin.avatarUrl = this.generarAvatarAleatorio();
        localStorage.setItem('usuarioAdministrador', JSON.stringify(parsedAdmin));
      }

      this.usuarioAdministrador = parsedAdmin;

      const adminNombre = `${parsedAdmin.nombre} (Admin)`;

      this.jugadores.push({
        nombre: adminNombre,
        modo: parsedAdmin.modo,
        avatar: parsedAdmin.avatarUrl,
        carta: ''
      });
    }

    if (jugadoresData) {
      const jugadoresCargados: Jugador[] = JSON.parse(jugadoresData);
      const adminNombreBase = this.usuarioAdministrador?.nombre || '';

      this.jugadores.push(...jugadoresCargados
        .filter(j => j.nombre !== adminNombreBase && j.nombre !== `${adminNombreBase} (Admin)`)
        .map(j => ({
          ...j,
          carta: j.carta || '',
          avatar: j.avatar || this.generarAvatarAleatorio()
        }))
      );
    }

    if (partida) {
      this.nombrePartida = partida;
    }
  }

  siguienteRonda(): void {
    this.jugadores = this.jugadores.map(j => ({ ...j, carta: '' }));
    localStorage.setItem('jugadores', JSON.stringify(
      this.jugadores.filter(j => !j.nombre.includes('(Admin)'))
    ));
  }

  private generarAvatarAleatorio(): string {
    const totalAvatares = 10;
    const numeroAleatorio = Math.floor(Math.random() * totalAvatares) + 1;
    return `assets/avatars/logo${numeroAleatorio}.jpg`;
  }
}
