import { HttpClient } from '@angular/common/http';
import {
  Injectable,
  signal,
  computed,
  inject,
  OnDestroy,
} from '@angular/core';
import { Session } from '../model/session.interface';
import { take } from 'rxjs';
import { UserDataService } from './user-data.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkLogService implements OnDestroy {
  private userData = inject(UserDataService);
  private routerService = inject(Router);
  private http = inject(HttpClient);
  private subscription: any;
  public workLog = signal<Session[]>([]);
  private initialized = signal<boolean>(false);

  constructor() {
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
            `${environment.apiUrl}/worklog/${this.userData.user().id}`
          )
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              this.workLog.set(res || []);
              this.initialized.set(true);
              resolve();
            },
            error: (err) => {
              console.error(err);
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

  addSession(session: Omit<Session, 'id'>) {

    const payload = {
      userId: this.userData.user().id,
      date: session.date,
      timeWorked: session.timeWorked,
    };

    console.log('POST /worklog payload:', payload);

    this.http
      .post<Session>(`${environment.apiUrl}/worklog`, payload)
      .subscribe({
        next: (res) => {
          console.log('POST /worklog response:', res);
          const updatedLog = [...this.workLog(), res];
          this.workLog.set(updatedLog);
        },
        error: (err) => {
          console.error('POST /worklog error:', err);
          this.routerService.navigate(['/error', err.status]);
        },
      });
  }

  deleteWorkLog(sessionId: number) {
    this.http
      .delete(`${environment.apiUrl}/worklog/${sessionId}`)
      .subscribe({
        next: () => {
          this.workLog.update((logs) =>
            logs.filter((wl) => wl.id !== sessionId)
          );
        },
        error: (err) => this.routerService.navigate(['/error', err.status]),
      });
  }

  updateWorkLog(session: Session) {
    if (session.id === undefined) {
      console.warn('Cannot update session without ID', session);
      return;
    }

    const payload = {
      workLogId: session.id,
      userId: this.userData.user().id,
      date: session.date,
      timeWorked: session.timeWorked,
    };

    console.log('PUT /worklog payload:', payload);

    this.http
      .put<Session>(`${environment.apiUrl}/worklog`, payload)
      .subscribe({
        next: (updated) => {
          console.log('PUT /worklog response:', updated);
          this.workLog.update((logs) =>
            logs.map((wl) => (wl.id === updated.id ? updated : wl))
          );
        },
        error: (err) => {
          console.error('PUT /worklog error:', err);
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
