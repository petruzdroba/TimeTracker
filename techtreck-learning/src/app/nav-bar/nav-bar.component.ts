import { Component } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [MatSidenavModule],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.sass',
})
export class NavBarComponent {
  protected navBarStatus: 'OPEN' | 'CLOSE' = 'CLOSE';

  onToggle() {
    this.navBarStatus = this.navBarStatus === 'OPEN' ? 'CLOSE' : 'OPEN';
  }

  navPress(element: string) {
    console.log(element);
  }
}
