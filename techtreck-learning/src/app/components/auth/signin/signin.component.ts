import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  OnDestroy,
  Output,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { UserDataService } from '../../../service/user-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.sass',
})
export class SigninComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();
  private authService = inject(UserDataService);
  private router = inject(Router);
  private subscription?: Subscription;

  hidePassword = true;
  hideConfirmPassword = true;
  error: string | null = null;

  protected form = new FormGroup(
    {
      name: new FormControl<string>('', { validators: [Validators.required] }),
      email: new FormControl<string>('', {
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl<string>('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ],
      }),
      confirmPassword: new FormControl<string>('', {
        validators: [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(20),
        ],
      }),
    },
    { validators: this.passwordMatchValidator }
  );

  private passwordMatchValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log('INVALID FORM');
      return;
    }

    if (
      this.form.value.name &&
      this.form.value.email &&
      this.form.value.password
    ) {
      const userData = {
        name: this.form.value.name,
        email: this.form.value.email,
        password: this.form.value.password,
      };

      this.subscription = this.authService.signUp(userData).subscribe({
        next: (response) => {
          this.authService.saveUserData(response, false);
          this.form.reset();
          this.closeWindow();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          if (error.status === 409) {
            this.error = 'Email already exists';
            this.form.get('email')?.reset();
          } else {
            this.error = 'An error occurred. Please try again later.';
          }
          console.error('Signup error:', error);
        },
      });
    }
  }

  onReset() {
    this.form.reset();
    this.error = null;
  }

  closeWindow() {
    this.close.emit();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
