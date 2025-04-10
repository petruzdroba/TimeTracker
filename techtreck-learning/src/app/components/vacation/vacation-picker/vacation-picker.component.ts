import { Component } from '@angular/core';

import { VacationFormComponent } from '../vacation-form/vacation-form.component';

@Component({
  selector: 'app-vacation-picker',
  standalone: true,
  imports: [VacationFormComponent],
  templateUrl: './vacation-picker.component.html',
  styleUrl: './vacation-picker.component.sass',
})
export class VacationPickerComponent {}
