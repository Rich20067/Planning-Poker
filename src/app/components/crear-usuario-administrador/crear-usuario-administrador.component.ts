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
          Validators.pattern(/^(?!\d+$)(?=(?:\D*\d){0,3}\D*$)[a-zA-Z0-9]+$/)
        ]
      ],
      modo: ['', Validators.required]
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
        avatarUrl: this.avatarService.generarAvatarAleatorio()
      };

      // Guardar usando la propiedad correcta: modo (no modoVisualizacion)
      localStorage.setItem('usuarioAdministrador', JSON.stringify(usuarioAdministrador));

      this.router.navigate(['/mesa-votacion']);
    } else {
      this.adminForm.markAllAsTouched();
    }
  }
}

interface UsuarioAdministrador {
  nombre: string;
  modo: string;
  avatarUrl: string;
}