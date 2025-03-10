import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateFilter } from '../../model/date-filter.interface';

@Component({
  selector: 'app-date-filter',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './date-filter.component.html',
  styleUrl: './date-filter.component.sass',
})
export class DateFilterComponent {
  @Input({ required: true }) calendarPicker!: 'past' | 'future' | 'all';
  @Output() dateFilter = new EventEmitter<DateFilter>();

  protected form = new FormGroup({
    startDate: new FormControl(),
    endDate: new FormControl(), //today
  });

  pastCalendar = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    return (d || new Date()) < today;
  };

  futureCalendar = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    return (d || new Date()) > today;
  };

  allCalendar = (date: Date | null): boolean => {
    return true;
  };

  onReset() {
    this.form.reset();
    this.onSubmit();
  }

  onSubmit() {
    this.dateFilter.emit({
      startDate: this.form.value.startDate,
      endDate: this.form.value.endDate,
    });
  }
}
