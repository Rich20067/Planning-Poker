import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-unirse-partida',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './unirse-partida.component.html',
  styleUrls: ['./unirse-partida.component.css'],
})
export class UnirsePartidaComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();

  nombrePartida: string = '';
  esInvitado: boolean = false;
  form: FormGroup;
  esEspectador: boolean = false; // Nueva propiedad para determinar si es espectador.

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private avatarService: AvatarService
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      modo: ['jugador', Validators.required]
    });
  }

  ngOnInit(): void {
    this.nombrePartida = this.route.snapshot.queryParamMap.get('nombrePartida') || '';
    this.esInvitado = this.route.snapshot.queryParamMap.get('invitado') === 'true';

    // Verificar si el jugador es espectador, si lo es, cambiar el modo.
    if (this.esInvitado) {
      this.esEspectador = true;
      this.form.patchValue({
        modo: 'espectador'
      });
    }
  }

  unirse(): void {
    if (this.form.invalid || !this.nombrePartida) return;

    const nuevoJugador = {
      nombre: this.form.value.nombre,
      modo: this.form.value.modo,
      idPartida: this.nombrePartida,
      avatarUrl: this.avatarService.generarAvatarAleatorio(),
      carta: null,
      cartaSeleccionada: false
    };

    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');

    // Si el jugador es el administrador, asignamos el rol de administrador correctamente.
    if (nuevoJugador.modo === 'espectador' && jugadores.length === 0) {
      // Si no hay jugadores, el primer espectador será el administrador.
      nuevoJugador.modo = 'administrador';
    }

    jugadores.push(nuevoJugador);
    localStorage.setItem(storageKey, JSON.stringify(jugadores));

    // Guardar al administrador como el jugador actual.
    if (nuevoJugador.modo === 'administrador') {
      localStorage.setItem('usuarioAdministrador', JSON.stringify(nuevoJugador));
    } else {
      localStorage.setItem('usuarioActual', JSON.stringify(nuevoJugador));
    }

    this.cerrar.emit(); // cierra overlay y fuerza carga de mesa
  }
}
