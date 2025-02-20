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
    window.localStorage.clear();
    window.location.reload();
  }
}
