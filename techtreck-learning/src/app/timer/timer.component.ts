import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ProgressBarComponent } from '../progress-bar/progress-bar.component';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [DatePipe, ProgressBarComponent],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.sass',
})
export class TimerComponent implements OnInit {
  private startTime = new Date(0, 0, 0);
  private endTime = new Date(0, 0, 0);
  protected requiredTime = 7200000;
  protected timerType: 'ON' | 'OFF' = 'OFF';

  ngOnInit(): void {
    const storedStartTime = window.localStorage.getItem('startTime');
    const storedEndTime = window.localStorage.getItem('endTime');
    const storedRemainingTime = window.localStorage.getItem('remainingTime');

    if (storedStartTime) {
      this.startTime = new Date(JSON.parse(storedStartTime));
    }

    if (storedEndTime) {
      this.endTime = new Date(JSON.parse(storedEndTime));
    }

    const currentTime = new Date();
    const dateLastSession = new Date(this.startTime);
    currentTime.setHours(0, 0, 0, 0);
    dateLastSession.setHours(0, 0, 0, 0);
    if (currentTime.getTime() === dateLastSession.getTime()) {
      if (storedRemainingTime) {
        this.requiredTime = JSON.parse(storedRemainingTime);
      }
    } else {
      //resets if dates are different, 2 hours a day for each new day
      this.requiredTime = 7200000;
    }
  }

  get elapsedTime() {
    const elapsed = this.endTime.getTime() - this.startTime.getTime();
    return elapsed;
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

      window.localStorage.setItem('startTime', JSON.stringify(this.startTime));
      window.localStorage.setItem('endTime', JSON.stringify(this.endTime));
      window.localStorage.setItem(
        'remainingTime',
        JSON.stringify(this.requiredTime)
      );
    }
  }
}
