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
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WorkLogService implements OnDestroy {
  private userData = inject(UserDataService);
  private routerService = inject(Router);
  private http = inject(HttpClient);
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
            `${environment.apiUrl}/worklog/${this.userData.user().id}`
          )
          .pipe(take(1))
          .subscribe({
            next: (res) => {
              this.workLog.set(res || []);
              this.initialized.set(true);
            },
            error: (err) => {
              console.error(err);
              this.routerService.navigate(['/error', err.status]);
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

  addSession(newSession: Omit<Session, 'id'>) {
    this.http
      .post<Session>(`${environment.apiUrl}/worklog`, {
        userId: this.userData.user().id,
        ...newSession,
      })
      .subscribe({
        next: (saved) => {
          this.workLog.update((logs) => [...logs, saved]);
        },
        error: (err) => this.routerService.navigate(['/error', err.status]),
      });
  }

  deleteWorkLog(sessionId: number) {
    this.http.delete(`${environment.apiUrl}/worklog/${sessionId}`).subscribe({
      next: () => {
        this.workLog.update((logs) => logs.filter((wl) => wl.id !== sessionId));
      },
      error: (err) => this.routerService.navigate(['/error', err.status]),
    });
  }

  updateWorkLog(session: Session) {
    this.http.put<Session>(`${environment.apiUrl}/worklog`,
      {
        userId: this.userData.user().id,
        ...session,
      })
    .subscribe({
      next: (updated) => {
        this.workLog.update((logs) =>
          logs.map((wl) => (wl.id === updated.id ? updated : wl))
        );
      },
      error: (err) => this.routerService.navigate(['/error', err.status]),
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
