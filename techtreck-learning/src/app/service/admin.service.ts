import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { UserData } from '../model/user-data.interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService implements OnDestroy {
  private routerService = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000';
  private subscription: any;

  private adminData = signal<UserData[]>([] as UserData[]);

  constructor() {
    this.fetchAdminData();
  }

  initialize(): Promise<void> {
    return this.fetchAdminData();
  }

  private fetchAdminData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .get<UserData[]>(`${this.baseUrl}/adminfe/get/`)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.adminData.set(res);
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error/' + err.status]);
            reject(err);
          },
        });
    });
  }

  updateUser(data: UserData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.subscription = this.http
        .put<UserData>(`${this.baseUrl}/user/update/`, { data: data })
        .subscribe({
          next: () => {
            this.fetchAdminData();
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error/' + err.status]);
            reject(err);
          },
        });
    });
  }

  readonly getAdminData = computed(() => this.adminData());

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
