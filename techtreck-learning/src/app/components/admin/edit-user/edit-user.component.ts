import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UserData } from '../../../model/user-data.interface';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AdminService } from '../../../service/admin.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [
    EditBoxComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.sass',
})
export class EditUserComponent implements OnChanges {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) user!: UserData | null;
  @Output() closeWindow = new EventEmitter<void>();
  private adminService = inject(AdminService);

  protected form = new FormGroup({
    workHours: new FormControl<number>(this.user?.workHours ?? 0, {
      validators: Validators.required,
    }),
    personalTime: new FormControl<number>(this.user?.personalTime ?? 0, {
      validators: Validators.required,
    }),
    vacationDays: new FormControl<number>(this.user?.vacationDays ?? 0, {
      validators: Validators.required,
    }),
    role: new FormControl<string>(this.user?.role ?? 'employee', {
      validators: Validators.required,
    }),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user) {
      this.form.patchValue({
        workHours: this.user?.workHours,
        personalTime: this.user?.personalTime,
        vacationDays: this.user?.vacationDays,
        role: this.user?.role,
      });
    }
  }

  async onSubmit() {
    if (this.form.valid && this.user) {
      if (
        this.form.value.workHours &&
        this.form.value.role &&
        this.form.value.personalTime &&
        this.form.value.vacationDays
      ) {
        const updatedUser: UserData = {
          ...this.user,
          role: this.form.value.role,
          workHours: this.form.value.workHours,
          personalTime: this.form.value.personalTime,
          vacationDays: this.form.value.vacationDays,
        };

        await this.adminService.updateUser(updatedUser);
        this.onCloseWindow();
      }
    }
  }

  onReset() {
    if (!this.user) return;
    this.form.patchValue({
      workHours: this.user.workHours,
      personalTime: this.user.personalTime,
      vacationDays: this.user.vacationDays,
      role: this.user.role,
    });
  }

  onCloseWindow() {
    this.closeWindow.emit();
  }
}
