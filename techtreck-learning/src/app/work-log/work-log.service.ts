import { Injectable } from '@angular/core';
import { Session } from './session.interface';

@Injectable({
  providedIn: 'root',
})
export class WorkLogService {
  private workLog: Session[] = [];

  get getWorkLog() {
    return this.workLog;
  }

  addSession(newSession: Session) {
    this.workLog.push(newSession);
  }

  updateWorkLog() {
    window.localStorage.setItem('workLog', JSON.stringify(this.workLog));
  }

  initWorkLog() {
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
