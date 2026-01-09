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
  styleUrl: './timer.component.css',
})
export class TimerComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);
  private timerService = inject(TimerService);
  private workLogService = inject(WorkLogService);

  protected timerData = signal<TimerData>({} as TimerData);
  protected workLog = signal<Session[]>([]);

  private interval!: NodeJS.Timeout;
  protected TIME_REQ!: number;

  async ngOnInit(): Promise<void> {
    await this.workLogService.initialize();

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
      return 0;
    }
    return elapsed;
  }

  get firstClockIn(): Date | undefined {
  const todaySession = this.workLogService.firstClockIn;
  if (todaySession && this.timerData().startTime) {
    return new Date(this.timerData().startTime);
  }
  return undefined;
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSession = this.workLogService.getWorkLog.find((s) => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    console.log('Starting timer. Elapsed time:', this.elapsedTime);
    console.log('Existing session:', existingSession);

    if (existingSession && existingSession.id) {
      console.log('Found existing session with id:', existingSession.id);
    } else {
      console.log('Creating new session for today');
      const newSession = {
        date: today,
        timeWorked: 0,
      };
      this.workLogService.addSession(newSession);

      setTimeout(() => {
        this.workLog.set(this.workLogService.getWorkLog);
      }, 1000);
    }

    this.interval = setInterval(() => {
      this.timerData.update(current => ({
        ...current,
        requiredTime: current.requiredTime - 1000,
      }));

      // Update local workLog display for today's session
      const todaySession = this.workLogService.getWorkLog.find((s) => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === today.getTime();
      });

      if (todaySession && todaySession.id) {
        const currentElapsed = this.elapsedTime;
        // Update the service's internal state
        this.workLogService['workLog'].update((logs: Session[]) =>
          logs.map((s: Session) =>
            s.id === todaySession.id
              ? { ...s, timeWorked: currentElapsed }
              : s
          )
        );
        // Update local state
        this.workLog.set(this.workLogService.getWorkLog);
      }
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingSession = this.workLogService.getWorkLog.find((s) => {
      const sessionDate = new Date(s.date);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime();
    });

    const elapsedTime = this.TIME_REQ - currentTimer.requiredTime;

    console.log('Pausing timer. Elapsed time (ms):', elapsedTime);
    console.log('Elapsed time (formatted):', new Date(elapsedTime).toISOString());
    console.log('Existing session:', existingSession);

    if (existingSession && existingSession.id) {
      console.log('Updating session with id:', existingSession.id);
      const updatedSession: Session = {
        ...existingSession,
        timeWorked: elapsedTime,
      };
      this.workLogService.updateWorkLog(updatedSession);
    } else {
      console.log('Creating new session on pause');
      const newSession = {
        date: today,
        timeWorked: elapsedTime,
      };
      this.workLogService.addSession(newSession);
    }

    this.timerService.updateTimerData(updatedTimer);
    this.timerData.set(updatedTimer);

    // Wait for save to complete
    setTimeout(() => {
      if (window.localStorage.getItem('timerData')) {
        this.snackBar.open('Session recorded successfully!', '', {
          duration: 2000,
        });
      }

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }, 500);
  }
}
