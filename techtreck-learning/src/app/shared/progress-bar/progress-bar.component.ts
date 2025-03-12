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
  @Input({ required: true }) currentValue!: number;
  @Input({ required: true }) totalValue!: number;
  @Input({ required: true }) class!: string;

  get valueStatus() {
    return ((this.currentValue / this.totalValue) * 100).toFixed(0);
  }
}
