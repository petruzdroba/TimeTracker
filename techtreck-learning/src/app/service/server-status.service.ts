import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { take } from 'rxjs';
import { interval, Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServerStatusService implements OnDestroy {
  private http = inject(HttpClient);

  private serverStatus = signal<boolean>(false);
  readonly getServerStatus = computed(() => this.serverStatus());

  private pollingSubscription?: Subscription;

  private fetchServerStatus(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .get<boolean>(environment.apiUrl + '/server/status/')
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.serverStatus.set(true);
            resolve();
          },
          error: () => {
            this.serverStatus.set(false);
            reject(new Error('Server is not reachable'));
          },
        });
    });
  }

  constructor() {
    this.fetchServerStatus();

    this.pollingSubscription = interval(10000).subscribe(() => {
      this.fetchServerStatus().catch(() => {});
    });
  }

  ngOnDestroy(): void {
    this.pollingSubscription?.unsubscribe();
  }
}
