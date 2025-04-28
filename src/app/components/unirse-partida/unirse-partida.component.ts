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
  }

  unirse(): void {
    if (this.form.invalid || !this.nombrePartida) {
      return;
    }

    const nuevoJugador = {
      nombre: this.form.value.nombre,
      modo: this.form.value.modo, // 'jugador' o 'espectador'
      idPartida: this.nombrePartida,
      avatarUrl: this.avatarService.generarAvatarAleatorio(),
      carta: null,
      rol: this.form.value.modo === 'jugador' ? 'jugador' : 'espectador' // Aquí aseguramos que el rol esté bien asignado
    };

    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');
    jugadores.push(nuevoJugador);
    localStorage.setItem(storageKey, JSON.stringify(jugadores));

    this.cerrar.emit(); // Solo cierra el formulario flotante
  }
}
