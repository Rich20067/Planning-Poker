import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-crear-partida',
  standalone: true,
  templateUrl: './crear-partida.component.html',
  styleUrls: ['./crear-partida.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class CrearPartidaComponent {
  partidaForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.partidaForm = this.fb.group({
      nombre: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^(?!.*[_.\-*/#])(?=(?:.*\d){0,3})[A-Za-z\d ]+$/)
      ]]
      
    });
  }

  get nombre() {
    return this.partidaForm.get('nombre');
  }

  crearPartida() {
    if (this.partidaForm.valid) {
      alert(`¡Partida creada con nombre: ${this.nombre?.value}!`);
    } else {
      this.partidaForm.markAllAsTouched();
    }
  }
}
