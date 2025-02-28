import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

interface Vacation {
  startDate: Date;
  endDate: Date;
  description: string;
}

@Component({
  selector: 'app-vacation-picker',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vacation-picker.component.html',
  styleUrl: './vacation-picker.component.sass',
})
export class VacationPickerComponent {
  protected selectedDate: Date | null = null;
  @Input({ required: true }) remainingVacation!: number;
  @Output() addVacationEvent = new EventEmitter<Vacation>();
  protected form = new FormGroup({
    startDate: new FormControl(null, { validators: Validators.required }),
    endDate: new FormControl(null, { validators: Validators.required }),
    description: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(70)],
    }),
  });

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    // Prevent Saturday (6) and Sunday (0) from being selected.
    return day !== 0 && day !== 6 && (d || new Date()) >= today;
  };

  get dateValidation() {
    if (this.form.value.startDate && this.form.value.endDate) {
      return validateDateRange(
        this.form.value.startDate,
        this.form.value.endDate,
        this.remainingVacation
      );
    }
    return false;
  }

  onSubmit() {
    if (this.form.invalid) {
      console.log('INVALID FORM');
      return;
    }

    if (
      this.form.value.startDate &&
      this.form.value.endDate &&
      this.form.value.description
    ) {
      if (
        !validateDateRange(
          this.form.value.startDate,
          this.form.value.endDate,
          this.remainingVacation
        )
      ) {
        console.log('Date range cannot exceed 30 days');
        this.form.get('endDate')?.reset();
        return;
      }

      this.addVacationEvent.emit({
        startDate: this.form.value.startDate,
        endDate: this.form.value.endDate,
        description: this.form.value.description,
      });
    }
    this.form.reset();
  }

  onReset() {
    this.form.reset();
  }
}

function validateDateRange(
  startDate: Date,
  endDate: Date,
  maxDays: number
): boolean {
  let currentDate = new Date(startDate);
  let count = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDate();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Exclude Sundays (0) and Saturdays (6)
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count <= maxDays;
}
