import { HttpClient } from '@angular/common/http';
import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { Session } from '../model/session.interface';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkLogService implements OnDestroy {
  private http = inject(HttpClient);
  private baseUrl =
    'https://b4c7a985-29f1-454e-a42e-97347971520e.mock.pstmn.io';
  private subscribtion!: any;

  private workLog = signal<Session[]>([]);
  constructor() {
    this.http
      .get(`${this.baseUrl}/worklog/get`)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (Array.isArray(res)) {
            this.workLog.set(res);
          } else {
            this.workLog.set([{ date: new Date(), timeWorked: 0 }]);
            //nu dam update pentru ca stergem tot
            // this.updateWorkLog();
          }
        },
      });
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
    this.subscribtion = this.http
      .put(`${this.baseUrl}/worklog/update`, this.workLog())
      .subscribe({
        next: (res) => {},
        error: (err) => {},
      });
  }

  ngOnDestroy(): void {
    if (this.subscribtion) {
      this.subscribtion.unsubscribe();
    }
  }
}
