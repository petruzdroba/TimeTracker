import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './progress-bar.component.html',
  styleUrl: './progress-bar.component.sass',
})
export class ProgressBarComponent {
  @Input({ required: true }) elapsedTime!: number;
  @Input({ required: true }) timerType!: 'ON' | 'OFF';
  @Input({ required: true }) requiredTime!: number;

  get valueStatus() {
    const timer = this.elapsedTime;
    return (timer / this.requiredTime) * 100;
  }
}
