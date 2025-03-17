import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Session } from '../../model/session.interface';
import { WorkLogService } from '../../service/work-log.service';
import { TimerService } from '../../service/timer.service';
import { ResetButtonComponent } from '../../shared/reset-button/reset-button.component';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [DatePipe, ProgressBarComponent, ResetButtonComponent],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.sass',
})
export class TimerComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  protected timerService = inject(TimerService);
  private workLogService = inject(WorkLogService);

  protected requiredTime!: number;
  private startTime!: Date;
  private endTime!: Date;
  protected timerType!: 'ON' | 'OFF';
  protected workLog!: Session[];

  private interval!: NodeJS.Timeout;

  ngOnInit(): void {
    this.requiredTime = this.timerService.requiredTime;
    this.startTime = this.timerService.startTime;
    this.endTime = this.timerService.endTime;
    this.timerType = this.timerService.timerType;
    this.workLog = this.workLogService.getWorkLog;
    if (this.timerType === 'ON') {
      this.startTimer();
    }
  }

  get elapsedTime() {
    const elapsed = 7200000 - this.requiredTime;
    return elapsed;
  }

  get firstClockIn(): Date | undefined {
    return this.workLogService.getFirstClockIn(this.startTime)?.date;
  }

  get workedTimeToday(): Date | undefined {
    const timeWorked = this.workLogService.getFirstClockIn(
      this.startTime
    )?.timeWorked;
    if (timeWorked) {
      return new Date(timeWorked);
    }
    return undefined;
  }

  get currentDate() {
    return new Date();
  }

  startTimer() {
    this.timerType = 'ON';
    this.startTime = new Date();
    this.timerService.updateTimerData({
      startTime: this.startTime,
      endTime: this.endTime,
      requiredTime: this.requiredTime,
      timerType: this.timerType,
    });
    const newSession = {
      date: new Date(),
      timeWorked: this.elapsedTime,
    };

    this.workLogService.addSession(newSession);

    this.interval = setInterval(() => {
      if (this.requiredTime > 0) {
        this.requiredTime -= 1000;
      } //else
    }, 1000);
  }

  pauseTimer() {
    this.timerType = 'OFF';
    clearInterval(this.interval);

    this.endTime = new Date();
    const newSession = {
      date: new Date(),
      timeWorked: this.elapsedTime,
    };

    this.workLogService.addSession(newSession);
    this.timerService.updateTimerData({
      startTime: this.startTime,
      endTime: this.endTime,
      requiredTime: this.requiredTime,
      timerType: this.timerType,
    });

    if (window.localStorage.getItem('timerData')) {
      this.snackBar.open('Session recorded successfully !', '', {
        duration: 2000,
      });
    }
    window.location.reload();
  }
}
