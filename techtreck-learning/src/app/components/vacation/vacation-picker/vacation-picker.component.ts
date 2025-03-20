import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
  Input,
  inject,
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
import { Vacation } from '../../../model/vacation.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  @Input({ required: true }) futureVacations!: Vacation[];
  @Output() addVacationEvent = new EventEmitter<Vacation>();
  protected form = new FormGroup({
    startDate: new FormControl(null, { validators: Validators.required }),
    endDate: new FormControl(null, { validators: Validators.required }),
    description: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(70)],
    }),
  });
  private snackBar = inject(MatSnackBar);

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    let alreadyTaken: boolean = true;
    if (day != null && d != undefined) {
      this.futureVacations.map((vacation) => {
        const dateA = new Date(vacation.startDate);
        const dateB = new Date(vacation.endDate);

        if (
          d?.getTime() >= dateA.getTime() &&
          d?.getTime() <= dateB.getTime() &&
          vacation.status !== 'denied'
        ) {
          alreadyTaken = false;
        }
      });
    }
    // Prevent Saturday (6) and Sunday (0) from being selected.
    return alreadyTaken && day !== 0 && day !== 6 && (d || new Date()) >= today;
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
        //console.log('Date range cannot exceed 30 days');
        this.form.get('endDate')?.reset();
        return;
      }

      this.addVacationEvent.emit({
        startDate: this.form.value.startDate,
        endDate: this.form.value.endDate,
        description: this.form.value.description,
        status: 'pending',
      });
      this.snackBar.open('Vacation request sent !', '', {
        duration: 2000,
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
