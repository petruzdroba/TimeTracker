import { Component, Output, EventEmitter } from '@angular/core';
import { LeaveFormComponent } from '../leave-form/leave-form.component';
import { LeaveSlip } from '../../../model/leave-slip.interface';

@Component({
  selector: 'app-leave-slip-picker',
  standalone: true,
  imports: [LeaveFormComponent],
  templateUrl: './leave-slip-picker.component.html',
  styleUrl: './leave-slip-picker.component.sass',
})
export class LeaveSlipPickerComponent {
  @Output() addLeave = new EventEmitter<LeaveSlip>();

  onLeaveAdded(leaveData: LeaveSlip) {
    this.addLeave.emit(leaveData);
  }
}
