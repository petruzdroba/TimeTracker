import { HttpClient } from '@angular/common/http';
import { UserData } from '../model/user-data.interface';
import { Injectable, signal, computed, inject, OnDestroy } from '@angular/core';
import { Observable, take } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UserDataService implements OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private subscription: any;
  private baseUrl = 'http://127.0.0.1:8000';

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
    return this.http.post<UserData>(`${this.baseUrl}/auth/login/`, data);
  }

  signUp(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup/`, data);
  }

  checkRememberedUser(): void {
    if (typeof window !== 'undefined') {
      const remembered = window.localStorage.getItem('rememberMe');
      if (remembered) {
        const parsed = JSON.parse(remembered);
        if (parsed.rememberMe) {
          this.subscription = this.http
            .get<UserData>(`${this.baseUrl}/auth/getuser/${parsed.id}/`)
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
    return this.http.post(`${this.baseUrl}+/user/delete/`, {
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
