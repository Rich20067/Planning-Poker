import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-crear-usuario-administrador',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './crear-usuario-administrador.component.html',
  styleUrls: ['./crear-usuario-administrador.component.css']
})
export class CrearUsuarioAdministradorComponent {
  adminForm: FormGroup;
  nombrePartida: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private avatarService: AvatarService
  ) {
    this.adminForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(20),
          Validators.pattern(/^(?!\d+$)(?!.*[_.\-*/#])(?=(?:[^0-9]*[0-9]){0,3}[^0-9]*$)[A-Za-z0-9 ]+$/)
        ]
      ],
      modo: ['jugador', Validators.required] // Modo por defecto
    });

    const nombreGuardado = localStorage.getItem('nombrePartida');
    if (nombreGuardado) {
      this.nombrePartida = nombreGuardado;
    }
  }

  get nombre() {
    return this.adminForm.get('nombre');
  }

  get modo() {
    return this.adminForm.get('modo');
  }

  crearUsuarioAdministrador() {
    if (this.adminForm.valid) {
      const adminData = this.adminForm.value;

      const usuarioAdministrador: UsuarioAdministrador = {
        nombre: adminData.nombre,
        modo: adminData.modo,
        avatarUrl: this.avatarService.generarAvatarAleatorio(),
        carta: null,
        cartaSeleccionada: false
      };

      // Guardar como administrador y usuario actual
      const adminJson = JSON.stringify(usuarioAdministrador);
      localStorage.setItem('usuarioAdministrador', adminJson);
      localStorage.setItem('usuarioActual', adminJson);
      localStorage.setItem(`usuario_${usuarioAdministrador.nombre}`, adminJson);
      sessionStorage.setItem('usuarioEnSesion', usuarioAdministrador.nombre);

      // Clave necesaria para cambio de modo
      localStorage.setItem(`usuario_${usuarioAdministrador.nombre}`, JSON.stringify(usuarioAdministrador));

      // Agregar a la lista de jugadores sin duplicar
      const storageKey = `jugadores_${this.nombrePartida}`;
      const jugadores: UsuarioAdministrador[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const yaExiste = jugadores.some((j: UsuarioAdministrador) => j.nombre === usuarioAdministrador.nombre);
      if (!yaExiste) {
        jugadores.push(usuarioAdministrador);
      }

      localStorage.setItem(storageKey, JSON.stringify(jugadores));

      // Redirigir a la mesa sin "invitado=true"
      this.router.navigate(['/mesa-votacion'], {
        queryParams: { nombrePartida: this.nombrePartida }
      });
    } else {
      this.adminForm.markAllAsTouched();
    }
  }
}

interface UsuarioAdministrador {
  nombre: string;
  modo: 'jugador' | 'espectador';
  avatarUrl: string;
  carta: number | null;
  cartaSeleccionada: boolean;
}
