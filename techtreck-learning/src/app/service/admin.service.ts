import { computed, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { UserData } from '../model/user-data.interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService implements OnDestroy {
  private router = inject(Router);
  private http = inject(HttpClient);
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
        .get<UserData[]>(`${environment.apiUrl}/user`)
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.adminData.set(res);
            resolve();
          },
          error: (err) => {
            this.router.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  updateUser(data: UserData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.subscription = this.http
        .put<UserData>(`${environment.apiUrl}/user/update/`,
           { data: data }
          )
        .subscribe({
          next: () => {
            this.fetchAdminData();
            resolve();
          },
          error: (err) => {
            this.router.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  // restoreVacation(userId: number): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.http
  //       .post(`${environment.apiUrl}/vacation/restore/`, { userId: userId })
  //       .pipe(take(1))
  //       .subscribe({
  //         next: () => {
  //           this.fetchAdminData();
  //           resolve();
  //         },
  //         error: (err) => {
  //           this.router.navigate(['/error', err.status]);
  //           reject(err);
  //         },
  //       });
  //   });
  // }

  // restoreLeaveTime(userId: number): Promise<void> {
  //   return new Promise((resolve, reject) => {
  //     this.http
  //       .post(`${environment.apiUrl}/leaveslip/restore/`, { userId: userId })
  //       .pipe(take(1))
  //       .subscribe({
  //         next: () => {
  //           this.fetchAdminData();
  //           resolve();
  //         },
  //         error: (err) => {
  //           this.router.navigate(['/error', err.status]);
  //           reject(err);
  //         },
  //       });
  //   });
  // }

  readonly getAdminData = computed(() => this.adminData());

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
