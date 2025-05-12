import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [provideRouter(routes)]
});
setTimeout(() => {
  const splash = document.getElementById('splash-screen');
  if (splash) splash.style.display = 'none';
}, 3000);
