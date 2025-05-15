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
}
