import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Vacation } from '../../../model/vacation.interface';
import { VacationService } from '../../../service/vacation.service';
import { validateDateRange } from '../../../shared/utils/time.utils';

@Component({
  selector: 'app-vacation-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vacation-form.component.html',
  styleUrl: './vacation-form.component.css',
})
export class VacationFormComponent implements OnInit, OnChanges {
  @Input({ required: true }) vacation!: Vacation | null;
  @Output() closeEditWindow = new EventEmitter<void>();
  @Output() vacationAdded = new EventEmitter<Omit<Vacation, 'id'>>();
  @Output() vacationEdited = new EventEmitter<[Vacation, Partial<Vacation>]>();

  private vacationService = inject(VacationService);

  protected form = new FormGroup({
    startDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
    }),
    endDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
    }),
    description: new FormControl<string>('', {
      validators: [Validators.required, Validators.maxLength(40)],
    }),
  });

  ngOnInit(): void {
    // Data now comes from service computed signals
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vacation'] && this.vacation?.startDate) {
      this.form.patchValue({
        startDate: this.vacation.startDate,
        endDate: this.vacation.endDate,
        description: this.vacation.description,
      });
    }
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    let alreadyTaken: boolean = true;

    if (day != null && d != undefined && this.vacation === null) {
      const futureVacations = this.vacationService.futureVacations$();

      futureVacations.forEach((vacation) => {
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

    return alreadyTaken && day !== 0 && day !== 6 && (d || new Date()) >= today;
  };

  get dateValidation() {
    if (this.form.value.startDate && this.form.value.endDate) {
      return validateDateRange(
        this.form.value.startDate,
        this.form.value.endDate,
        this.vacationService.remainingDays()
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
          this.vacationService.remainingDays()
        )
      ) {
        this.form.get('endDate')?.reset();
        return;
      }

      const newVacation = {
        startDate: new Date(this.form.value.startDate!),
        endDate: new Date(this.form.value.endDate!),
        description: this.form.value.description!,
        status: 'pending' as const,
      };

      if (this.vacation !== null) {
        this.vacationEdited.emit([this.vacation, newVacation]);
        this.closeEditWindow.emit();
      } else {
        this.vacationAdded.emit(newVacation);
      }
    }
    this.form.reset();
  }

  onReset() {
    if (this.vacation !== null) {
      this.form.patchValue({
        startDate: this.vacation.startDate,
        endDate: this.vacation.endDate,
        description: this.vacation.description,
      });
    } else {
      this.form.reset();
    }
  }
}
