import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-vacation',
  standalone: true,
  imports: [],
  templateUrl: './reset-vacation.component.html',
  styleUrl: './reset-vacation.component.sass',
})
export class ResetVacationComponent {
  onReset() {
    window.localStorage.setItem(
      'vacationData',
      JSON.stringify({
        remainingVacationDays: 14,
        pastVacations: [],
      })
    );
    window.location.reload();
  }
}
