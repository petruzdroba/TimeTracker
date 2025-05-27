import { UserData } from './../../../model/user-data.interface';
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
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { UserDataService } from '../../../service/user-data.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
export class LoginComponent implements OnDestroy {
  @Output() close = new EventEmitter<void>();
  private authService = inject(UserDataService);
  private router = inject(Router);
  private subscription?: Subscription;
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

      this.subscription = this.authService.logIn(userData).subscribe({
        next: (response) => {
          this.authService.saveUserData(response, true);
          this.form.reset();
          this.closeWindow();
          this.router.navigate(['/home']);
        },
        error: (error) => {
          if (error.status === 401) {
            this.error = 'Invalid email or password';
            this.form.reset();
          } else if (error.status === 404) {
            this.error = 'User not found';
            this.form.reset();
          } else {
            this.error = 'An error occurred. Please try again later.';
          }
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
