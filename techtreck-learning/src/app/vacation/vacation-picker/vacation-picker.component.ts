import {
  ChangeDetectionStrategy,
  Component,
  Output,
  EventEmitter,
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
  date: Date;
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
  @Output() addVacationEvent = new EventEmitter<Vacation>();
  protected form = new FormGroup({
    date: new FormControl(null, { validators: Validators.required }),
    description: new FormControl('', { validators: Validators.required }),
  });

  myFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    const today = new Date();
    // Prevent Saturday and Sunday from being selected.
    return day !== 0 && day !== 6 && (d || new Date()) >= today;
  };

  onSubmit() {
    if (this.form.invalid) {
      console.log('INVALID FORM');
      return;
    }

    if (this.form.value.date && this.form.value.description) {
      this.addVacationEvent.emit({
        date: this.form.value.date,
        description: this.form.value.description,
      });
    }
    this.form.reset();
  }

  onReset() {
    this.form.reset();
  }
}
