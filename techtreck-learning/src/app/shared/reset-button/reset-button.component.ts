import { Component, Input } from '@angular/core';
import { TimerService } from '../../service/timer.service';
import { VacationService } from '../../service/vacation.service';
import { LeaveSlipService } from '../../service/leave-slip.service';

@Component({
  selector: 'app-reset-button',
  standalone: true,
  imports: [],
  templateUrl: './reset-button.component.html',
  styleUrl: './reset-button.component.sass',
})
export class ResetButtonComponent {
  @Input({ required: true }) service!:
    | TimerService
    | VacationService
    | LeaveSlipService;

  onReset() {
    this.service.resetData();
  }
}
