import { computed, inject, Injectable, signal } from '@angular/core';
import { TimerData } from '../model/timer-data.interface';
import { UserDataService } from './user-data.service';

@Injectable({ providedIn: 'root' })
export class TimerService {
  private userData = inject(UserDataService);
  private timerData = signal<TimerData>({
    startTime: new Date(),
    endTime: new Date(),
    requiredTime: this.userData.user().workHours * 60 * 60 * 1000 || 7200000,
    timerType: 'OFF',
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const storedData = window.localStorage.getItem('timerData');

      if (storedData) {
        const parsed = JSON.parse(storedData);
        const today = new Date();
        const lastSessionDate = new Date(parsed.startTime);

        if (this.isSameDay(today, lastSessionDate)) {
          // If timer was running, calculate elapsed time
          if (parsed.timerType === 'ON') {
            const elapsedTime =
              new Date().getTime() - new Date(parsed.startTime).getTime();
            parsed.remainingTime -= elapsedTime;
          }

          this.timerData.set({
            startTime: new Date(parsed.startTime),
            endTime: new Date(parsed.endTime),
            requiredTime: parsed.remainingTime,
            timerType: parsed.timerType,
          });
        } //else remains the same as default data for new day
      }
    }
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    return d1.getTime() === d2.getTime();
  }

  readonly _requiredTime = computed(() => this.timerData().requiredTime);
  readonly _startTime = computed(() => this.timerData().startTime);
  readonly _endTime = computed(() => this.timerData().endTime);
  readonly _timerType = computed(() => this.timerData().timerType);
  readonly _timerData = computed(() => this.timerData());

  public get requiredTime(): number {
    return this._requiredTime();
  }

  public get startTime(): Date {
    return this._startTime();
  }

  public get endTime(): Date {
    return this._endTime();
  }

  public get timerType(): 'ON' | 'OFF' {
    return this._timerType();
  }

  public get timer(): TimerData {
    return this._timerData();
  }

  updateTimerData(timerData: TimerData) {
    // Update both signal and localStorage
    this.timerData.set(timerData);
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
    const defaultData: TimerData = {
      startTime: new Date(),
      endTime: new Date(),
      requiredTime: this.userData.user().workHours * 60 * 60 * 1000 || 7200000,
      timerType: 'OFF',
    };

    this.timerData.set(defaultData);
    window.localStorage.setItem(
      'timerData',
      JSON.stringify({
        startTime: defaultData.startTime,
        endTime: defaultData.endTime,
        remainingTime: defaultData.requiredTime,
        timerType: defaultData.timerType,
      })
    );

    window.location.reload();
  }
  readonly workingHoursFull = computed(
    () => this.userData.user().workHours * 60 * 60 * 1000 || 7200000
  );
}
