import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  signal,
  computed,
  inject,
  OnDestroy,
  effect,
} from '@angular/core';
import { Session } from '../model/session.interface';
import { take, firstValueFrom } from 'rxjs';
import { UserDataService } from './user-data.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class WorkLogService implements OnDestroy {
  private userData = inject(UserDataService);
  private routerService = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000';
  private subscription: any;

  private workLog = signal<Session[]>([]);
  private initialized = signal<boolean>(false);

  constructor() {
    // Start initialization but don't block constructor
    this.initialize().catch((err) => {
      console.error('Failed to initialize WorkLogService:', err);
      this.routerService.navigate(['/error']);
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized()) return;

    if (this.userData.isLoggedIn()) {
      return new Promise((resolve, reject) => {
        this.http
          .get<Session[]>(
            `${this.baseUrl}/worklog/get/${this.userData.user().id}/`
          )
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              if (
                Array.isArray(res) &&
                !(res.length === 1 && Object.keys(res[0]).length === 0)
              ) {
                this.workLog.set(res);
              } else {
                this.workLog.set([{ date: new Date(), timeWorked: 0 }]);
              }
              this.initialized.set(true);
              resolve();
            },
            error: (err) => {
              this.routerService.navigate(['/error', err.status]);
              reject(err);
            },
          });
      });
    }
  }

  get getWorkLog() {
    return this.workLog();
  }

  private readonly _firstClockIn = computed(() =>
    this.workLog().find((session) => {
      const currentTime = new Date();
      const dateLastSession = new Date(session.date);
      currentTime.setHours(0, 0, 0, 0);
      dateLastSession.setHours(0, 0, 0, 0);
      return currentTime.getTime() === dateLastSession.getTime();
    })
  );

  get firstClockIn() {
    return this._firstClockIn();
  }

  addSession(newSession: Session) {
    this.workLog.update((sessions) => {
      const currentSessions = [...sessions];

      const index = currentSessions.findIndex((session) => {
        const currentTime = new Date(newSession.date);
        const dateLastSession = new Date(session.date);
        currentTime.setHours(0, 0, 0, 0);
        dateLastSession.setHours(0, 0, 0, 0);
        return currentTime.getTime() === dateLastSession.getTime();
      });
      if (index !== -1) {
        return [
          ...currentSessions.slice(0, index),
          {
            ...currentSessions[index],
            timeWorked: newSession.timeWorked,
          },
          ...currentSessions.slice(index + 1),
        ];
      }
      return [...currentSessions, newSession];
    });
    this.updateWorkLog();
  }

  deleteSession(erasedSession: Session) {
    this.workLog.update((sessions) =>
      sessions.filter((session) => session !== erasedSession)
    );
    this.updateWorkLog();
  }

  editSession(oldSession: Session, startTime: Date, endTime: Date) {
    this.workLog.update((sessions) => {
      const index = sessions.findIndex((session) => {
        const dateA = new Date(session.date);
        const dateB = new Date(oldSession.date);
        return (
          dateA.getTime() === dateB.getTime() &&
          session.timeWorked === oldSession.timeWorked
        );
      });

      if (index !== -1) {
        const oldDate = new Date(oldSession.date);
        const newDate = new Date(oldDate);
        newDate.setHours(startTime.getHours());
        newDate.setMinutes(startTime.getMinutes());
        newDate.setSeconds(startTime.getSeconds());

        const timeWorked = endTime.getTime() - startTime.getTime();

        return [
          ...sessions.slice(0, index),
          {
            date: newDate,
            timeWorked: timeWorked,
          },
          ...sessions.slice(index + 1),
        ];
      }
      return sessions;
    });
    this.updateWorkLog();
  }
  updateWorkLog() {
    this.subscription = this.http
      .put(`${this.baseUrl}/worklog/update/`, {
        userId: this.userData.user().id,
        data: this.workLog(),
      })
      .subscribe({
        next: (res) => {},
        error: (err) => {
          this.routerService.navigate(['/error', err.status]);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
