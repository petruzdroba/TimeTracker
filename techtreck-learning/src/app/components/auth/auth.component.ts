import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';
import { UserDataService } from '../../service/user-data.service';
import { InfoComponent } from './info/info.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatTabsModule, LoginComponent, SigninComponent, InfoComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  @Output() close = new EventEmitter<void>();
  private userService = inject(UserDataService);
  routerService = inject(Router);

  get isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  get currentRoute() {
    return this.routerService.url;
  }

  closeWindow() {
    this.close.emit();
  }
}
