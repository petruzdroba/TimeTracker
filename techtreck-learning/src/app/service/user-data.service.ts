import { HttpClient } from '@angular/common/http';
import { UserData } from '../model/user-data.interface';
import { Injectable, signal, computed, inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private http = inject(HttpClient);
  private baseUrl =
    'https://b4c7a985-29f1-454e-a42e-97347971520e.mock.pstmn.io';

  private userData = signal<UserData>({
    id: -1,
    name: 'NoUser',
    email: 'NoEmail',
    workHours: 4,
    vacationDays: 0,
    personalTime: 0,
  });

  public readonly user = computed(() => this.userData());

  saveUserData(user: UserData, rememberMe: boolean): void {
    this.userData.set(user);
    if (rememberMe) {
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('rememberMe', 'true');
    }
  }

  logIn(data: { email: string; password: string }): Observable<UserData> {
    return this.http.post<UserData>(`${this.baseUrl}/auth/login`, data);
  }

  signUp(data: {
    name: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/signup`, data);
  }

  checkRememberedUser(): UserData | null {
    const remembered = localStorage.getItem('rememberMe');
    if (remembered) {
      const storedUser = localStorage.getItem('userData');
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem('userData');
    localStorage.removeItem('rememberMe');
    this.userData.set({
      id: -1,
      name: 'NoUser',
      email: 'NoEmail',
      workHours: 0,
      vacationDays: 0,
      personalTime: 0,
    });
  }
}
