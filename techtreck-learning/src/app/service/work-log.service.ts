import { Injectable, signal } from '@angular/core';
import { Session } from '../model/session.interface';

@Injectable({
  providedIn: 'root',
})
export class WorkLogService {
  private workLog = signal<Session[]>([]);

  constructor() {
    if (typeof window !== 'undefined') {
      const storedWorkLogString = window.localStorage.getItem('workLog');
      if (storedWorkLogString === null || storedWorkLogString === 'undefined') {
        this.workLog.set([{ date: new Date(), timeWorked: 0 }]);
        this.updateWorkLog();
      } else {
        const storedWorkLog = JSON.parse(storedWorkLogString);
        if (Array.isArray(storedWorkLog)) {
          this.workLog.set(storedWorkLog);
        } else {
          this.workLog.set([{ date: new Date(), timeWorked: 0 }]);
          this.updateWorkLog();
        }
      }
    }
  }

  get getWorkLog() {
    return this.workLog;
  }

  addSession(newSession: Session) {
    this.workLog.update((sessions) => {
      const currentSessions = [...sessions];
      const index = currentSessions.findIndex((session) => {
        const currentTime = new Date();
        const dateLastSession = new Date(session.date);
        currentTime.setHours(0, 0, 0, 0);
        dateLastSession.setHours(0, 0, 0, 0);
        return currentTime.getTime() === dateLastSession.getTime();
      });

      if (index !== -1) {
        currentSessions[index] = {
          ...currentSessions[index],
          timeWorked: newSession.timeWorked,
        };
      } else {
        currentSessions.push(newSession);
      }
      return currentSessions;
    });
    this.updateWorkLog();
  }

  deleteSession(erasedSession: Session) {
    this.workLog.update((sessions) =>
      sessions.filter((session) => session !== erasedSession)
    );
    this.updateWorkLog();
  }

  updateWorkLog() {
    window.localStorage.setItem('workLog', JSON.stringify(this.workLog()));
  }

  get firstClockIn() {
    return this.workLog().find((session) => {
      const currentTime = new Date();
      const dateLastSession = new Date(session.date);
      currentTime.setHours(0, 0, 0, 0);
      dateLastSession.setHours(0, 0, 0, 0);
      if (currentTime.getTime() === dateLastSession.getTime()) {
        return true;
      }
      return false;
    });
  }
}
