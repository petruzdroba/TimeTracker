import { Injectable } from '@angular/core';
import { Session } from '../model/session.interface';

@Injectable({
  providedIn: 'root',
})
export class WorkLogService {
  private workLog: Session[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const storedWorkLogString = window.localStorage.getItem('workLog');
      if (storedWorkLogString) {
        const storedWorkLog = JSON.parse(storedWorkLogString);
        if (Array.isArray(storedWorkLog)) {
          this.workLog = storedWorkLog;
        } else {
          this.workLog = [{ date: new Date(), timeWorked: 0 }];
        }
      } else {
        this.workLog = [{ date: new Date(), timeWorked: 0 }];
        this.updateWorkLog();
      }
    }
  }

  get getWorkLog() {
    return this.workLog;
  }

  addSession(newSession: Session) {
    const index = this.workLog.findIndex((session) => {
      const dateA = new Date(session.date);
      return (
        dateA.getDay() == newSession.date.getDay() &&
        dateA.getMonth() == newSession.date.getMonth() &&
        dateA.getFullYear() == newSession.date.getFullYear()
      );
    });

    if (index !== -1) {
      this.workLog[index].timeWorked = newSession.timeWorked;
    } else {
      this.workLog.push(newSession);
    }
    this.updateWorkLog();
  }

  deleteSession(erasedSession: Session) {
    this.workLog = [
      ...this.workLog.filter((session) => session !== erasedSession),
    ];
    this.updateWorkLog();
  }

  updateWorkLog() {
    window.localStorage.setItem('workLog', JSON.stringify(this.workLog));
  }

  getFirstClockIn(date: Date) {
    return this.workLog.find((session) => {
      const dateA = new Date(session.date);
      return (
        dateA.getDay() == date.getDay() &&
        dateA.getMonth() == date.getMonth() &&
        dateA.getFullYear() == date.getFullYear()
      );
    });
  }
}
