import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { UserDataService } from '../../../service/user-data.service';
import { UserData } from '../../../model/user-data.interface';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [
    EditBoxComponent,
    MatFormFieldModule,
    ReactiveFormsModule,
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.css',
})
export class InfoComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private userService = inject(UserDataService);
  private router = inject(Router);
  protected userData = signal<UserData>({} as UserData);

  protected showDialog: boolean = false;
  protected form = new FormGroup({
    password: new FormControl<string>('', {
      validators: [Validators.required],
    }),
  });
  protected accountDeleted: boolean = false;

  ngOnInit(): void {
    this.userData.set(this.userService.user());
  }

  onShowDialog(): void {
    this.showDialog = true;
  }

  onHideDialog(): void {
    this.showDialog = false;
  }

  onDelete(): void {
    if (this.form.value.password) {
      this.userService
        .delete(this.form.value.password)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.accountDeleted = true;
            setTimeout(() => {
              this.userService.logout();
            }, 1500);
          },
          error: (err) => {
            if (err.status === 401) {
              setTimeout(() => {
                this.userService.logout();
              }, 500);
            }
            this.onHideDialog();
            this.close.emit();
            this.router.navigate(['/error', err.status]);
          },
        });
    }
  }

  onLogout(): void {
    this.userService.logout();
    this.close.emit();
  }
}
