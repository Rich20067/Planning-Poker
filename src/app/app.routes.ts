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
  }
];
