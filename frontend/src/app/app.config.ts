import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // To jest kluczowe

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter([]),
    provideHttpClient()
  ]
};