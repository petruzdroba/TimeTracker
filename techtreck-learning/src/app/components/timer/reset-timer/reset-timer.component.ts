import { Component } from '@angular/core';

@Component({
  selector: 'app-reset-timer',
  standalone: true,
  imports: [],
  templateUrl: './reset-timer.component.html',
  styleUrl: './reset-timer.component.sass',
})
export class ResetTimerComponent {
  onReset() {
    window.localStorage.setItem(
      'timerData',
      JSON.stringify({
        startTime: 0,
        endTime: 0,
        remainingTime: 7200000,
        timerType: 'OFF',
      })
    );
    window.location.reload();
  }
}
