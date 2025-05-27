import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Session } from '../../model/session.interface';
import { WorkLogService } from '../../service/work-log.service';
import { TimerService } from '../../service/timer.service';
import { TimerData } from '../../model/timer-data.interface';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [DatePipe, ProgressBarComponent],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.sass',
})
export class TimerComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private timerService = inject(TimerService);
  private workLogService = inject(WorkLogService);

  protected timerData = signal<TimerData>({} as TimerData);
  protected workLog = signal<Session[]>([]);

  private interval!: NodeJS.Timeout;
  protected TIME_REQ!: number;

  ngOnInit(): void {
    this.timerData.set(this.timerService.timer);
    this.workLog.set(this.workLogService.getWorkLog);
    this.TIME_REQ = this.timerService.workingHoursFull();
    if (this.timerData().timerType === 'ON') {
      this.startTimer();
    }
  }

  ngOnDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  get elapsedTime() {
    const elapsed = this.TIME_REQ - this.timerData().requiredTime;
    if (elapsed < 0) {
      return this.timerData().requiredTime;
    }
    return elapsed;
  }

  get firstClockIn(): Date | undefined {
    return this.workLogService.firstClockIn?.date;
  }

  get workedTimeToday(): Date | undefined {
    const timeWorked = this.workLogService.firstClockIn?.timeWorked;
    if (timeWorked) {
      return new Date(timeWorked);
    }
    return undefined;
  }

  get currentDate() {
    return new Date();
  }

  startTimer() {
    const currentTimer = this.timerData();
    const updatedTimer: TimerData = {
      ...currentTimer,
      timerType: 'ON',
      startTime: new Date(),
    };
    this.timerService.updateTimerData(updatedTimer);
    this.timerData.set(updatedTimer);

    const newSession = {
      date: new Date(),
      timeWorked: this.elapsedTime,
    };

    this.workLogService.addSession(newSession);

    this.interval = setInterval(() => {
      const updatedTimer = {
        ...this.timerData(),
        requiredTime: this.timerData().requiredTime - 1000,
      };
      this.timerData.set(updatedTimer);
    }, 1000);
  }

  pauseTimer() {
    const currentTimer = this.timerData();

    const updatedTimer: TimerData = {
      ...currentTimer,
      timerType: 'OFF',
      endTime: new Date(),
    };

    clearInterval(this.interval);

    const newSession: Session = {
      date: new Date(),
      timeWorked: this.TIME_REQ - currentTimer.requiredTime,
    };

    this.workLogService.addSession(newSession);
    this.timerService.updateTimerData(updatedTimer);

    this.timerData.set(updatedTimer);
    this.workLog.set(this.workLogService.getWorkLog);

    if (window.localStorage.getItem('timerData')) {
      this.snackBar.open('Session recorded successfully!', '', {
        duration: 2000,
      });
    }

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }
}
