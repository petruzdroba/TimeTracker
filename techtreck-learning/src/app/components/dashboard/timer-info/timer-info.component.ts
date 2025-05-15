import { Component, inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TimerService } from '../../../service/timer.service';
import { DatePipe } from '@angular/common';
import { WorkLogService } from '../../../service/work-log.service';

@Component({
  selector: 'app-timer-info',
  standalone: true,
  imports: [MatProgressSpinnerModule, DatePipe],
  templateUrl: './timer-info.component.html',
  styleUrl: './timer-info.component.sass',
})
export class TimerInfoComponent implements OnInit {
  private timerService = inject(TimerService);
  private workLogService = inject(WorkLogService);
  private zone = inject(NgZone);

  protected requiredTime = this.timerService.workingHoursFull;
  protected remainingTime: number = 0;
  protected currentTime = new Date();

  ngOnInit(): void {
    this.remainingTime = this.timerService.requiredTime;
    this.updateTime();
  }

  updateTime(): void {
    this.zone.runOutsideAngular(() => {
      setInterval(() => {
        this.currentTime = new Date();
      }, 6000);
    });
  }

  get procentageValue() {
    return (100 - (this.remainingTime / this.requiredTime) * 100).toFixed(0);
  }

  get today() {
    return this.currentTime;
  }

  get timerType() {
    return this.timerService.timerType;
  }

  get firstLogIn() {
    return this.workLogService.firstClockIn?.date === undefined
      ? '-'
      : this.workLogService.firstClockIn?.date;
  }
}
