import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.sass',
})
export class TimerComponent implements OnInit {
  private startTime = new Date(0, 0, 0);
  private endTime = new Date(0, 0, 0);
  timerType: 'ON' | 'OFF' = 'OFF';

  ngOnInit(): void {
    //adauga local storage later
    console.log(this.startTime.getHours());
    console.log(this.endTime.getHours());
  }

  get elapsedTime() {
    const elapsed = this.endTime.getTime() - this.startTime.getTime() - 7200000;
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
      // console.log(
      //   `START TIME ${this.startTime.getHours()}:${this.startTime.getMinutes()}`
      // );
      // console.log(
      //   `END TIME ${this.endTime.getHours()}:${this.endTime.getMinutes()}`
      // );
    }
  }
}
