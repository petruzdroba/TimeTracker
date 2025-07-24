import { Component, Output, EventEmitter } from '@angular/core';

import { VacationFormComponent } from '../vacation-form/vacation-form.component';
import { Vacation } from '../../../model/vacation.interface';

@Component({
  selector: 'app-vacation-picker',
  standalone: true,
  imports: [VacationFormComponent],
  templateUrl: './vacation-picker.component.html',
  styleUrl: './vacation-picker.component.css',
})
export class VacationPickerComponent {
  @Output() addVacation = new EventEmitter<Vacation>();

  onVacationAdded(vacation: Vacation) {
    this.addVacation.emit(vacation);
  }
}
