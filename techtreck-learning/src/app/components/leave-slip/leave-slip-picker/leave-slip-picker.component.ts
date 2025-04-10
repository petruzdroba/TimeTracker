import { Component } from '@angular/core';

import { LeaveFormComponent } from '../leave-form/leave-form.component';

@Component({
  selector: 'app-leave-slip-picker',
  standalone: true,
  imports: [LeaveFormComponent],
  templateUrl: './leave-slip-picker.component.html',
  styleUrl: './leave-slip-picker.component.sass',
})
export class LeaveSlipPickerComponent {}
