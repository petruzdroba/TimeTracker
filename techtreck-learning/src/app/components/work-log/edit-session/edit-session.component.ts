import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { Session } from '../../../model/session.interface';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  transformDateToTimeString,
  transformTimeStringToDate,
  validateTimeRangeString,
} from '../../../shared/utils/time.utils';
import { WorkLogService } from '../../../service/work-log.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-session',
  standalone: true,
  imports: [EditBoxComponent, DatePipe, ReactiveFormsModule],
  templateUrl: './edit-session.component.html',
  styleUrl: './edit-session.component.css',
})
export class EditSessionComponent implements OnChanges {
  @Input({ required: true }) isOpen!: boolean;
  @Input({ required: true }) session!: Session | null;
  @Output() closeWindow = new EventEmitter<void>();
  private workLogService = inject(WorkLogService);
  private snackBar = inject(MatSnackBar);

  protected form = new FormGroup({
    startTime: new FormControl('13:00', {
      validators: Validators.required,
    }),
    endTime: new FormControl('15:00', {
      validators: Validators.required,
    }),
  });

  ngOnChanges(changes: SimpleChanges) {
    if (changes['session'] && this.session?.date) {
      this.form.patchValue({
        startTime: transformDateToTimeString(this.session.date).slice(0, 5),
        endTime: transformDateToTimeString(new Date(this.endTime)).slice(0, 5),
      });
    }
  }

  get endTime(): number {
    if (this.session) {
      const startTime = new Date(this.session.date).getTime();
      return startTime + this.session.timeWorked;
    }
    return 0;
  }

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
    if (this.form.value.startTime && this.form.value.endTime) {
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
      if (this.session) {
        this.workLogService.editSession(
          this.session,
          transformTimeStringToDate(this.form.value.startTime + ':00'),
          transformTimeStringToDate(this.form.value.endTime + ':00')
        );
      }

      this.snackBar.open('Session edited successfully !', '', {
        duration: 2000,
      });

      // setTimeout(() => {
      //   window.location.reload();
      // }, 2000);

      this.closeWindow.emit();
    }
  }

  onReset() {
    if (this.session?.date) {
      this.form
        .get('endTime')
        ?.setValue(
          transformDateToTimeString(new Date(this.endTime)).slice(0, 5)
        );
      this.form
        .get('startTime')
        ?.setValue(transformDateToTimeString(this.session.date).slice(0, 5));
    }
  }

  onCloseWindow() {
    this.closeWindow.emit();
  }
}
