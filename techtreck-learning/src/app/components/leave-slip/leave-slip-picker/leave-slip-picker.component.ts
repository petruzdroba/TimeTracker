import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { provideNativeDateAdapter } from '@angular/material/core';
import { LeaveSlip } from '../../../model/leave-slip.interface';
import { start } from 'repl';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-leave-slip-picker',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
  ],
  templateUrl: './leave-slip-picker.component.html',
  styleUrl: './leave-slip-picker.component.sass',
})
export class LeaveSlipPickerComponent {
  @Input({ required: true }) remainingTime!: number;
  @Output() addLeaveEvent = new EventEmitter<LeaveSlip>();
  private snackBar = inject(MatSnackBar);

  protected form = new FormGroup({
    startTime: new FormControl('', {
      validators: Validators.required,
    }),
    endTime: new FormControl('', {
      validators: Validators.required,
    }),
    date: new FormControl('', {
      validators: Validators.required,
    }),
    description: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(20)],
    }),
  });

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    return day !== 0 && day !== 6 && (d || new Date()) > today;
  };

  get descriptionLength(): number {
    return this.form.value.description?.length || 0;
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log('INVALID FORM');
      return;
    }

    if (
      this.form.value.startTime &&
      this.form.value.endTime &&
      this.form.value.description &&
      this.form.value.date
    ) {
      if (
        !validateTimeRange(
          this.form.value.startTime,
          this.form.value.endTime,
          this.remainingTime
        )
      ) {
        this.form.get('endTime')?.reset();
        return;
      }
      this.addLeaveEvent.emit({
        startTime: transformTimeStringToDate(this.form.value.startTime + ':00'),
        endTime: transformTimeStringToDate(this.form.value.endTime + ':00'),
        description: this.form.value.description,
        date: new Date(this.form.value.date),
        status: 'pending',
      });
      this.snackBar.open('Leave request sent !', '', {
        duration: 2000,
      });
      this.form.reset();
    }
  }

  onReset() {
    this.form.reset();
  }
}

function transformTimeStringToDate(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, seconds, 0);
  return now;
}

function validateTimeRange(
  startTime: string,
  endTime: string,
  remainingTime: number
): boolean {
  const dateA = transformTimeStringToDate(startTime + ':00');
  const dateB = transformTimeStringToDate(endTime + ':00');

  return (
    dateB.getTime() - dateA.getTime() <= remainingTime &&
    dateB.getTime() - dateA.getTime() > 0
  );
}
