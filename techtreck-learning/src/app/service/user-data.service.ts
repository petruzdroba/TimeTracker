import { HttpClient } from '@angular/common/http';
import { UserData } from '../model/user-data.interface';
import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { map, Observable, take, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserDataService implements OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private subscription: any;

  private userData = signal<UserData>({
    id: -1,
    name: 'NoUser',
    email: 'NoEmail',
    workHours: 8,
    vacationDays: 0,
    personalTime: 0,
    role: 'NoRole',
  });
  public readonly user = computed(() => this.userData());
  public readonly isLoggedIn = computed(() => this.userData().id !== -1);
  public readonly isAdmin = computed(() => this.userData().role === 'admin');
  public readonly isManager = computed(
    () => this.userData().role === 'manager'
  );

  constructor() {
    this.checkRememberedUser();
  }

  saveUserData(user: UserData, rememberMe: boolean): void {
    this.userData.set(user);
    if (rememberMe) {
      localStorage.setItem(
        'rememberMe',
        JSON.stringify({ rememberMe: true, id: user.id })
      );
    }
  }

  logIn(data: { email: string; password: string }): Observable<UserData> {
    return this.http
      .post<{ access: string; refresh: string; user: UserData }>(
        `${environment.apiUrl}/auth/login/`,
        data
      )
      .pipe(
        take(1),
        tap((res) => {
          localStorage.setItem('authToken', res.access);
          localStorage.setItem('refreshToken', res.refresh);
          localStorage.setItem('userData', JSON.stringify(res.user));
          this.userData.set(res.user);
        }),
        map((res) => res.user)
      );
  }

  signUp(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/signup/`, data);
  }

  checkRememberedUser(): void {
    if (typeof window !== 'undefined') {
      const remembered = window.localStorage.getItem('rememberMe');
      if (remembered) {
        const parsed = JSON.parse(remembered);
        if (parsed.rememberMe) {
          this.subscription = this.http
            .get<UserData>(`${environment.apiUrl}/auth/getuser/${parsed.id}/`)
            .pipe(take(1))
            .subscribe({
              next: (user) => {
                this.userData.set(user);
              },
              error: (err) => {
                this.router.navigate(['/error', err.status]);
              },
            });
        }
      }
    }
  }

  delete(password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/user/delete/`, {
      userId: this.userData().id,
      password: password,
    });
  }

  logout(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('timerData');
    this.userData.set({
      id: -1,
      name: 'NoUser',
      email: 'NoEmail',
      workHours: 0,
      vacationDays: 0,
      personalTime: 0,
      role: 'NoRole',
    });
    this.reloadPage();
  }

  reloadPage(): void {
    window.location.reload();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
