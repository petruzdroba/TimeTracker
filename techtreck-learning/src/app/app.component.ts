import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { ThemeService } from './service/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent {
  title = 'techtreck-learning';
}
