import { Injectable } from '@angular/core';
import { Vacation } from '../model/vacation.interface';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private _requiredTime!: number;
  private _startTime!: Date;
  private _endTime!: Date;
  private _timerType!: 'ON' | 'OFF';

  constructor() {
    if (typeof window !== 'undefined') {
      const storedTimerDataString = window.localStorage.getItem('timerData');
      if (storedTimerDataString) {
        const storedTimerDataObject = JSON.parse(storedTimerDataString);

        this._timerType = storedTimerDataObject.timerType;

        this._startTime = new Date(storedTimerDataObject.startTime);
        this._endTime = new Date(storedTimerDataObject.endTime);

        //compares if start time is today
        const currentTime = new Date();
        const dateLastSession = new Date(this._startTime);
        currentTime.setHours(0, 0, 0, 0);
        dateLastSession.setHours(0, 0, 0, 0);
        if (currentTime.getTime() === dateLastSession.getTime()) {
          if (storedTimerDataObject.remainingTime) {
            this._requiredTime = storedTimerDataObject.remainingTime;
          }
        } else {
          //reset required hours
          this._requiredTime = 7200000;

          //no sessions for today so we set a marker to tell us that
          this._startTime = new Date();
          this._endTime = new Date();
        }

        if (this._timerType === 'ON') {
          const elapsedTime = new Date().getTime() - this._startTime.getTime();
          this._requiredTime -= elapsedTime;
        }
      }
    }
  }

  public get requiredTime(): number {
    return this._requiredTime;
  }

  public get startTime(): Date {
    return this._startTime;
  }

  public get endTime(): Date {
    return this._endTime;
  }

  public get timerType(): 'ON' | 'OFF' {
    return this._timerType;
  }

  updateTimerData(timerData: {
    startTime: Date;
    endTime: Date;
    requiredTime: number;
    timerType: 'ON' | 'OFF';
  }) {
    window.localStorage.setItem(
      'timerData',
      JSON.stringify({
        startTime: timerData.startTime,
        endTime: timerData.endTime,
        remainingTime: timerData.requiredTime,
        timerType: timerData.timerType,
      })
    );
  }

  resetData() {
    window.localStorage.setItem(
      'timerData',
      JSON.stringify({
        startTime: 0,
        endTime: 0,
        remainingTime: 7200000,
        timerType: 'OFF',
      })
    );
    window.location.reload();
  }
}
