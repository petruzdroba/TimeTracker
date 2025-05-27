import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { ThemeService } from '../../service/theme.service';
import { EditBoxComponent } from '../edit-box/edit-box.component';
import { AuthComponent } from '../../components/auth/auth.component';
@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatSidenavModule, EditBoxComponent, AuthComponent],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.sass',
})
export class NavBarComponent {
  private routerService = inject(Router);
  protected navBarStatus: 'OPEN' | 'CLOSE' = 'CLOSE';
  private themeService = inject(ThemeService);
  protected loginWindow: boolean = false;

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

  openLoginWindow() {
    if (this.currentRoute !== '/auth') {
      this.loginWindow = true;
    }
  }

  closeLoginWindow() {
    this.loginWindow = false;
  }
}
