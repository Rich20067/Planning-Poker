import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

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

  constructor(private fb: FormBuilder, private router: Router) {
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

    //  nombre de la partida desde el localStorage
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
      const adminData: UsuarioAdministrador = this.adminForm.value;
      console.log('Usuario Administrador creado:', adminData);
      // Puedes redirigir o hacer algo con adminData aquí
    } else {
      this.adminForm.markAllAsTouched();
    }
  }
}

interface UsuarioAdministrador {
  nombre: string;
  modo: 'jugador' | 'espectador';
}
