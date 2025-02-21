import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TimerComponent } from './timer/timer.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TimerComponent, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent {
  title = 'techtreck-learning';
}
