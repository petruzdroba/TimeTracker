import { DatePipe, Time } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { ResetTimerComponent } from './reset-timer/reset-timer.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Session {
  date: Date;
  timeWorked: number;
}

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [DatePipe, ProgressBarComponent, ResetTimerComponent],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.sass',
})
export class TimerComponent implements OnInit {
  private snackBar = inject(MatSnackBar);
  protected requiredTime = 7200000;
  private startTime = new Date(0, 0, 0);
  private endTime = new Date(0, 0, 0);
  protected timerType: 'ON' | 'OFF' = 'OFF';
  protected workLog!: Session[];

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const storedTimerDataString = window.localStorage.getItem('timerData');
      if (storedTimerDataString) {
        const storedTimerDataObject = JSON.parse(storedTimerDataString);

        this.startTime = new Date(storedTimerDataObject.startTime);
        this.endTime = new Date(storedTimerDataObject.endTime);

        const currentTime = new Date();
        const dateLastSession = new Date(this.startTime);
        currentTime.setHours(0, 0, 0, 0);
        dateLastSession.setHours(0, 0, 0, 0);
        if (currentTime.getTime() === dateLastSession.getTime()) {
          if (storedTimerDataObject.remainingTime) {
            this.requiredTime = storedTimerDataObject.remainingTime;
          }
        } else {
          //resets if dates are different, 2 hours a day for each new day
          this.requiredTime = 7200000;
        }
      }

      const storedWorkLogString = window.localStorage.getItem('workLog');
      if (storedWorkLogString) {
        const storedWorkLogObject = JSON.parse(storedWorkLogString);

        if (storedWorkLogObject.workLog) {
          this.workLog = storedWorkLogObject.workLog;
        } else {
          this.workLog = [{ date: new Date(), timeWorked: 0 }];
        }
      } else {
        this.workLog = [{ date: new Date(), timeWorked: 0 }];
        this.updateWorkLog();
      }
    }
  }

  get elapsedTime() {
    const elapsed = this.endTime.getTime() - this.startTime.getTime();
    return elapsed;
  }

  updateTimerData() {
    window.localStorage.setItem(
      'timerData',
      JSON.stringify({
        startTime: this.startTime,
        endTime: this.endTime,
        remainingTime: this.requiredTime,
      })
    );

    if (window.localStorage.getItem('timerData')) {
      this.snackBar.open('Session recorded successfully !', '', {
        duration: 2000,
      });
    }
  }

  updateWorkLog() {
    window.localStorage.setItem('workLog', JSON.stringify(this.workLog));
  }

  startTiming() {
    const currentTime = new Date();
    this.timerType = this.timerType === 'ON' ? 'OFF' : 'ON';

    console.log(this.timerType + ' timer ');
    console.log(currentTime.getHours() + ':' + currentTime.getMinutes());

    if (this.timerType === 'ON') {
      this.startTime = currentTime;
    } else {
      this.endTime = currentTime;
      this.requiredTime -= this.elapsedTime;

      this.workLog.push({
        date: new Date(),
        timeWorked: this.endTime.getTime() - this.startTime.getTime(),
      });

      this.updateWorkLog();
      this.updateTimerData();
    }
  }
}
