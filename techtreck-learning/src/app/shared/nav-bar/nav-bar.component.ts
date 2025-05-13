import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ThemeService } from '../../service/theme.service';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatSidenavModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.sass',
})
export class NavBarComponent {
  private routerService = inject(Router);
  protected navBarStatus: 'OPEN' | 'CLOSE' = 'CLOSE';
  private themeService = inject(ThemeService);

  onToggle() {
    this.navBarStatus = this.navBarStatus === 'OPEN' ? 'CLOSE' : 'OPEN';
  }

  navPress(routePath: string) {
    if (routePath !== 'timetrack') {
      this.routerService.navigate([`/${routePath}`]);
    } else {
      window.location.replace(`/${routePath}`);
    }
  }

  get runningTheme() {
    return this.themeService.runningTheme;
  }

  get currentRoute() {
    return this.routerService.url;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
