import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyComponent } from './components/currency/currency.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyComponent],
  template: `
    <main>
      <app-currency></app-currency>
    </main>
  `,
  styleUrls: ['./app.scss']
})
export class AppComponent {}