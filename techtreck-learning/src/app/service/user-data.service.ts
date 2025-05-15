import { UserData } from '../model/user-data.interface';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserDataService {
  private userData = signal<UserData>({
    id: -1,
    name: 'NoUser',
    email: 'NoEmail',
    workHours: 0,
    vacationDays: 0,
    personalTime: 0,
  });

  saveUserData(user: UserData, rememberMe: boolean): void {
    this.userData.set(user);
    if (rememberMe) {
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('rememberMe', 'true');
    }
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
