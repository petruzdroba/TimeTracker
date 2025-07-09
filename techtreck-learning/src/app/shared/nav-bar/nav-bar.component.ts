import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../../service/theme.service';
import { EditBoxComponent } from '../edit-box/edit-box.component';
import { AuthComponent } from '../../components/auth/auth.component';
import { filter, Subscription } from 'rxjs';
import { UserDataService } from '../../service/user-data.service';
import { ServerStatusComponent } from '../server-status/server-status.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [
    MatSidenavModule,
    EditBoxComponent,
    AuthComponent,
    ServerStatusComponent,
  ],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.sass',
})
export class NavBarComponent implements OnInit, OnDestroy {
  private routerService = inject(Router);
  private themeService = inject(ThemeService);
  private userService = inject(UserDataService);

  protected navBarStatus: 'OPEN' | 'CLOSE' = 'CLOSE';
  protected loginWindow: boolean = false;
  private routerSubscription?: Subscription;
  protected currentRoute: string = '';

  ngOnInit() {
    this.routerSubscription = this.routerService.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentRoute = this.routerService.url;
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  get userRole() {
    return this.userService.user().role;
  }

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
