import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { LoginComponent } from './login/login.component';
import { SigninComponent } from './signin/signin.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatTabsModule, LoginComponent, SigninComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.sass',
})
export class AuthComponent {}
