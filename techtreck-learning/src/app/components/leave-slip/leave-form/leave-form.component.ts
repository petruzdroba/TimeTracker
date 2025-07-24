import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { LeaveSlipService } from '../../../service/leave-slip.service';
import { LeaveSlip } from '../../../model/leave-slip.interface';
import {
  transformDateToTimeString,
  transformTimeStringToDate,
  validateTimeRangeString,
} from '../../../shared/utils/time.utils';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leave-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
  ],
  templateUrl: './leave-form.component.html',
  styleUrl: './leave-form.component.css',
})
export class LeaveFormComponent implements OnInit, OnChanges {
  @Input({ required: true }) leaveSlip!: LeaveSlip | null;
  @Output() leaveAdded = new EventEmitter<LeaveSlip>();
  @Output() leaveEdited = new EventEmitter<[LeaveSlip, LeaveSlip]>();
  @Output() closeEditWindow = new EventEmitter<void>();
  private leaveSlipService = inject(LeaveSlipService);
  private remainingTime!: number;
  protected form = new FormGroup({
    startTime: new FormControl<string>('', {
      validators: Validators.required,
    }),
    endTime: new FormControl<string>('', {
      validators: Validators.required,
    }),
    date: new FormControl<Date | null>(null, {
      validators: Validators.required,
    }),
    description: new FormControl<string>('', {
      validators: [Validators.required, Validators.maxLength(10)],
    }),
    reason: new FormControl<string>('', {
      validators: [Validators.maxLength(40)],
    }),
  });

  ngOnInit(): void {
    this.remainingTime = this.leaveSlipService.remainingTime;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['leaveSlip']) {
      if (this.leaveSlip) {
        this.form.patchValue({
          startTime: transformDateToTimeString(this.leaveSlip.startTime),
          endTime: transformDateToTimeString(this.leaveSlip.endTime),
          date: new Date(this.leaveSlip.date),
        });
        if (this.leaveSlip.description.includes('Other')) {
          this.form.patchValue({
            description: 'Other',
            reason: this.leaveSlip.description.replace('Other ', ''),
          });
        } else {
          this.form.patchValue({
            description: this.leaveSlip.description,
          });
        }
      } else {
        this.form.reset();
      }
    }
  }

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    return day !== 0 && day !== 6 && (d || new Date()) > today;
  };

  get descriptionLength(): number {
    return this.form.value.description?.length || 0;
  }

  get customDescription(): boolean {
    return this.form.value.description === 'Other';
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
        !validateTimeRangeString(
          this.form.value.startTime,
          this.form.value.endTime,
          this.remainingTime
        )
      ) {
        this.form.get('endTime')?.reset();
        return;
      }
      if (this.form.value.reason === null) {
        this.form.get('reason')?.setValue('');
      }

      const newLeaveSlip: LeaveSlip = {
        startTime: transformTimeStringToDate(this.form.value.startTime + ':00'),
        endTime: transformTimeStringToDate(this.form.value.endTime + ':00'),
        description: this.customDescription
          ? 'Other ' + this.form.value.reason
          : this.form.value.description,
        date: new Date(this.form.value.date),
        status: 'pending',
      };

      if (this.leaveSlip !== null) {
        // this.leaveSlipService.editLeaveSlip(this.leaveSlip, newLeaveSlip);
        this.leaveEdited.emit([this.leaveSlip, newLeaveSlip]);
        this.closeEditWindow.emit();
      } else {
        this.leaveAdded.emit(newLeaveSlip);
        this.form.reset();
      }
    }
  }
  onReset() {
    if (this.leaveSlip) {
      this.form.patchValue({
        startTime: transformDateToTimeString(this.leaveSlip.startTime),
        endTime: transformDateToTimeString(this.leaveSlip.endTime),
        date: new Date(this.leaveSlip.date),
        description: this.leaveSlip.description,
      });
    } else {
      this.form.reset();
    }
  }
}
