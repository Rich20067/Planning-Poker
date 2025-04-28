import { Routes } from '@angular/router';
import { CrearUsuarioAdministradorComponent } from './components/crear-usuario-administrador/crear-usuario-administrador.component';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/crear-partida/crear-partida.component').then(m => m.CrearPartidaComponent)
  },
  {
    path: 'crear-usuario-administrador',
    loadComponent: () =>
      import('./components/crear-usuario-administrador/crear-usuario-administrador.component').then(m => m.CrearUsuarioAdministradorComponent)
  },
  {
    path: 'mesa-votacion',
    loadComponent: () =>
      import('./components/mesa-votacion/mesa-votacion.component')
        .then(m => m.MesaVotacionComponent)
  },
  {
    path: 'unirse/:id',
    loadComponent: () => import('./components/unirse-partida/unirse-partida.component').then(m => m.UnirsePartidaComponent)
  }
  
];
