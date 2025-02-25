import { ChangeDetectionStrategy, Component } from '@angular/core';
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
    console.log(21321);
    this.form.reset();
  }

  onReset() {
    this.form.reset();
  }
}
