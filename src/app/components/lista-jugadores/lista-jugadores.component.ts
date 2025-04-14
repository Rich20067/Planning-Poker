import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PartidaService } from '../../core/services/partida.service';

@Component({
  selector: 'app-lista-jugadores',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-jugadores.component.html',
  styleUrls: ['./lista-jugadores.component.css']
})
export class ListaJugadoresComponent implements OnInit {
  jugadores: string[] = [];

  constructor(private partidaService: PartidaService) {}

  ngOnInit() {
    this.jugadores = this.partidaService.obtenerJugadores();
  }
}
