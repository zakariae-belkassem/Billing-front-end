import { LOCALE_ID, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import fr from '@angular/common/locales/fr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideNzI18n, fr_FR } from 'ng-zorro-antd/i18n';
import { routes } from './app.routes';

registerLocaleData(fr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    provideNzI18n(fr_FR),
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
