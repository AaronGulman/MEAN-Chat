import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Import provideHttpClient
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app/app.routes';

// Bootstrapping the main application with necessary providers
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations()
  ],
}).catch(err => console.error(err));
