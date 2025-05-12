import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-crear-partida',
  standalone: true,
  templateUrl: './crear-partida.component.html',
  styleUrls: ['./crear-partida.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class CrearPartidaComponent {
  partidaForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    this.partidaForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^(?!\d+$)(?!.*[_.\-*/#])(?=(?:[^0-9]*[0-9]){0,3}[^0-9]*$)[A-Za-z0-9 ]+$/)
      ]]
    });
  }

  get nombre() {
    return this.partidaForm.get('nombre');
  }

  crearPartida() {
    if (this.partidaForm.valid) {
      const nombrePartida = this.partidaForm.value.nombre;

      //  Guarda el nombre en localStorage
      localStorage.setItem('nombrePartida', nombrePartida);

      // Redirige a crear-usuario-administrador
      this.router.navigate(['/mesa-votacion'], {
        queryParams: { crearAdmin: 'true', nombrePartida }
      });
}
}
}