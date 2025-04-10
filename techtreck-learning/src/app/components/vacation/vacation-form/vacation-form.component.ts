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
  styleUrl: './vacation-form.component.sass',
})
export class VacationFormComponent implements OnInit, OnChanges {
  @Input({ required: true }) vacation!: Vacation | null;
  @Output() closeEditWindow = new EventEmitter<void>();

  private futureVacations: Vacation[] = [];
  private remainingDays: number = 0;
  private vacationService = inject(VacationService);

  protected form = new FormGroup({
    startDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
    }),
    endDate: new FormControl<Date | null>(null, {
      validators: Validators.required,
    }),
    description: new FormControl<string>('', {
      validators: [Validators.required, Validators.maxLength(70)],
    }),
  });

  ngOnInit(): void {
    this.futureVacations = this.vacationService.futureVacations;
    this.remainingDays = this.vacationService.remainingDays;
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
        this.remainingDays
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
          this.remainingDays
        )
      ) {
        //console.log('Date range cannot exceed 30 days');
        this.form.get('endDate')?.reset();
        return;
      }

      if (this.vacation !== null) {
        this.vacationService.editVacation(
          this.vacation
            ? this.vacation
            : {
                startDate: new Date(),
                endDate: new Date(),
                description: '',
                status: 'ignored',
              },
          {
            startDate: new Date(this.form.value.startDate),
            endDate: new Date(this.form.value.endDate),
            description: this.form.value.description,
            status: 'pending',
          }
        );
        this.closeEditWindow.emit();
      } else {
        this.vacationService.addVacation({
          startDate: new Date(this.form.value.startDate),
          endDate: new Date(this.form.value.endDate),
          description: this.form.value.description,
          status: 'pending',
        });
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
