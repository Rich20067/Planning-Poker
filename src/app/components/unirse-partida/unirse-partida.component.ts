import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
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
  form: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
  }

  unirse(): void {
    if (this.form.invalid || !this.nombrePartida) return;

    const storageKey = `jugadores_${this.nombrePartida}`;
    const jugadores = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const nuevoJugador = {
      idUsuario: Date.now(),
      nombre: this.form.value.nombre,
      modo: this.form.value.modo,
      idPartida: this.nombrePartida,
      avatarUrl: this.avatarService.generarAvatarAleatorio(),
      carta: null,
      cartaSeleccionada: false
    };

    jugadores.push(nuevoJugador);
    localStorage.setItem(storageKey, JSON.stringify(jugadores));
    localStorage.setItem(`usuario_${nuevoJugador.nombre}`, JSON.stringify(nuevoJugador));
    localStorage.setItem('usuarioActual', JSON.stringify(nuevoJugador));
    sessionStorage.setItem('usuarioEnSesion', nuevoJugador.nombre);
    
    const admin = localStorage.getItem('usuarioAdministrador');
    const adminNombre = admin ? JSON.parse(admin).nombre : '';

    this.cerrar.emit();

    this.router.navigate(['/mesa-votacion'], {
      queryParams: { nombrePartida: this.nombrePartida }
    });
    window.dispatchEvent(new StorageEvent('storage', { key: 'jugadores_' + this.nombrePartida }));

  }
}
