import { UserData } from './../../../model/user-data.interface';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UserDataService } from '../../../service/user-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.sass',
})
export class LoginComponent {
  private authService = inject(UserDataService);
  private router = inject(Router);
  hidePassword = true;
  error: string | null = null;

  protected form = new FormGroup({
    email: new FormControl<string>('', {
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      validators: [Validators.required],
    }),
  });

  onSubmit() {
    if (this.form.invalid) {
      console.log('INVALID FORM');
      return;
    }

    if (this.form.value.email && this.form.value.password) {
      const userData = {
        email: this.form.value.email,
        password: this.form.value.password,
      };

      this.authService.logIn(userData).subscribe({
        next: (response) => {
          // Handle successful login
          // this.authService.saveUserData(response, true);
          console.log('Login successful:', response);
          // this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          // Handle error
          if (error.status === 401) {
            this.error = 'Invalid email or password';
          } else {
            this.error = 'An error occurred. Please try again later.';
          }
          console.error('Login error:', error);
        },
      });
    }
  }

  onReset() {
    this.form.reset();
    this.error = null;
  }
}
