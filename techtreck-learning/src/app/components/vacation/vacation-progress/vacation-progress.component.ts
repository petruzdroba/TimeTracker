import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-vacation-progress',
  standalone: true,
  imports: [MatProgressBarModule],
  templateUrl: './vacation-progress.component.html',
  styleUrl: './vacation-progress.component.sass',
})
export class VacationProgressComponent {
  @Input({ required: true }) totalVacationDays!: number;
  @Input({ required: true }) remainingVacationDays!: number;

  get value() {
    return (
      100 -
      (this.remainingVacationDays / this.totalVacationDays) * 100
    ).toFixed(0);
  }
}
