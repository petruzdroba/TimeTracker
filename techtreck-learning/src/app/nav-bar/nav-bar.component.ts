import { Component, inject } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Router } from '@angular/router';
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

  onToggle() {
    this.navBarStatus = this.navBarStatus === 'OPEN' ? 'CLOSE' : 'OPEN';
  }

  navPress(routePath: string) {
    this.routerService.navigate([`/${routePath}`]);
  }
}
