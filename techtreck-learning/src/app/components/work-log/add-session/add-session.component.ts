import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { WorkLogService } from '../../../service/work-log.service';
import {
  transformTimeStringToDate,
  validateTimeRangeString,
} from '../../../shared/utils/time.utils';

@Component({
  selector: 'app-add-session',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    DatePipe,
    EditBoxComponent,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
  ],
  templateUrl: './add-session.component.html',
  styleUrl: './add-session.component.sass',
})
export class AddSessionComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Output() closeWindow = new EventEmitter<void>();
  private workLogService = inject(WorkLogService);

  protected form = new FormGroup({
    date: new FormControl<Date | null>(null, {
      validators: Validators.required,
    }),
    startTime: new FormControl('', {
      validators: Validators.required,
    }),
    endTime: new FormControl('', {
      validators: Validators.required,
    }),
  });

  myFilter = (d: Date | null): boolean => {
    if (!d) return false;

    const day = d.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    d.setHours(0, 0, 0, 0);

    if (d >= today) return false;

    if (day === 0 || day === 6) return false;

    const alreadyTaken = this.workLogService.getWorkLog.some((session) => {
      const sessionDate = new Date(session.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === d.getTime();
    });

    return !alreadyTaken;
  };

  get editedWorkTime(): Date {
    const startTimeString = (this.form.get('startTime')?.value as string) || '';
    const endTimeString = (this.form.get('endTime')?.value as string) || '';

    if (!startTimeString || !endTimeString) {
      return new Date(0);
    }

    const startTime = transformTimeStringToDate(startTimeString + ':00');
    const endTime = transformTimeStringToDate(endTimeString + ':00');

    if (endTime.getTime() < startTime.getTime()) {
      return new Date(0);
    }

    const timeDiff = endTime.getTime() - startTime.getTime();

    const utcDate = new Date(Date.UTC(1970, 0, 1, 0, 0, 0, timeDiff));
    return utcDate;
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }
    if (
      this.form.value.startTime &&
      this.form.value.endTime &&
      this.form.value.date
    ) {
      const startTime = transformTimeStringToDate(
        this.form.value.startTime + ':00'
      );
      const endTime = transformTimeStringToDate(
        this.form.value.endTime + ':00'
      );

      if (endTime.getTime() < startTime.getTime()) {
        this.form.get('endTime')?.setErrors({ invalidTimeRange: true });
        return;
      }
      if (
        !validateTimeRangeString(
          this.form.value.startTime,
          this.form.value.endTime,
          28800000 // 8 hours in milliseconds
        )
      ) {
        this.form.get('endTime')?.reset();
        return;
      }
      const timeDiff = endTime.getTime() - startTime.getTime();
      const dateObj = new Date(this.form.value.date);
      const combinedDate = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        startTime.getHours(),
        startTime.getMinutes(),
        startTime.getSeconds(),
        startTime.getMilliseconds()
      );
      this.workLogService.addSession({
        date: combinedDate,
        timeWorked: timeDiff,
      });
      this.form.reset();
      this.closeWindow.emit();
    }
  }

  onReset() {
    this.form.reset();
  }

  onCloseWindow() {
    this.closeWindow.emit();
  }
}
