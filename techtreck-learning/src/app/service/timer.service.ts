import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { TimerData } from '../model/timer-data.interface';
import { UserDataService } from './user-data.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TimerService implements OnDestroy {
  private userData = inject(UserDataService);
  private http = inject(HttpClient);
  private subscription: any;
  private router = inject(Router);

  private lastSync: Date = new Date();

  private timerData = signal<TimerData>({
    id: -1,
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
            id: this.userData.user().id,
            startTime: new Date(parsed.startTime),
            endTime: new Date(parsed.endTime),
            requiredTime: parsed.remainingTime,
            timerType: parsed.timerType,
          });
        }
      } else {
        //no local storage timer found, aka  user logged out
        this.fetchTimerData();
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
    this.syncTimerData();
  }

  fetchTimerData() {
    if (this.userData.isLoggedIn()) {
      this.http
        .get<TimerData>(
          environment.apiUrl + `/timer/get/${this.userData.user().id}/`
        )
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            if (this.isSameDay(new Date(), new Date(res.startTime))) {
              this.updateTimerData(res);
            }
          },
          error: (err) => {
            this.router.navigate(['/error', err]);
          },
        });
    }
  }

  syncTimerData() {
    const currentTime = new Date();
    if (
      currentTime.getTime() - this.lastSync.getTime() < 90000 &&
      this.userData.user().id !== -1
    ) {
      // Prevent syncing more than once every 15 minutes
      this.subscription = this.http
        .put<TimerData>(`${environment.apiUrl}/timer/sync/`, {
          userId: this.userData.user().id,
          data: this.timerData(),
        })
        .subscribe({
          next: () => {
            this.lastSync = currentTime;
          },
          error: (err) => {
            this.router.navigate(['/error', err]);
          },
        });
    }
  }

  ngOnDestroy() {
    //force a sync on destroy
    this.lastSync = new Date(new Date().getTime() - 1000000);
    this.syncTimerData();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  readonly workingHoursFull = computed(
    () => this.userData.user().workHours * 60 * 60 * 1000 || 7200000
  );
}
