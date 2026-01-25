import { Component, signal } from '@angular/core';
import { CurrencyComponent } from './components/currency/currency.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `<h1>{{ title() }}</h1>
             <app-currency></app-currency>`,
  styleUrls: ['./app.scss'],
  imports: [FormsModule, CurrencyComponent]
})
export class App {
  protected readonly title = signal('frontend');
}
