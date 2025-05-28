import { inject, Injectable, OnDestroy, signal, computed } from '@angular/core';
import { ManagerData } from '../model/manager-data.interface';
import { UserDataService } from './user-data.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take, map } from 'rxjs';
import { Vacation } from '../model/vacation.interface';
import { getDaysBetweenDates } from '../shared/utils/time.utils';

interface VacationWithUser {
  userId: number;
  vacation: Vacation;
}

@Injectable({ providedIn: 'root' })
export class ManagerService implements OnDestroy {
  private userData = inject(UserDataService);
  private routerService = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000';
  private subscription: any;

  private managerData = signal<ManagerData>({
    vacations: {},
    leaves: {},
  });

  constructor() {
    this.fetchManagerData();
  }

  private fetchManagerData() {
    this.subscription = this.http
      .get<{ vacations: any[]; leaves: any[] }>(this.baseUrl + '/manager/get/')
      .pipe(
        map((response) => ({
          vacations: Object.fromEntries(
            response.vacations.map((v) => [v.id, v])
          ),
          leaves: Object.fromEntries(response.leaves.map((l) => [l.id, l])),
        })),
        take(1)
      )
      .subscribe({
        next: (res) => {
          this.managerData.set(res);
        },
        error: (err) => {
          this.routerService.navigate(['/error', err.status]);
        },
      });
  }

  readonly futureVacations = computed(() => {
    const result: { userId: number; vacation: Vacation }[] = [];
    const vacations = this.managerData().vacations;

    for (const [userId, userData] of Object.entries(vacations)) {
      userData.futureVacations.forEach((vacation) => {
        result.push({
          userId: Number(userId),
          vacation,
        });
      });
    }
    return result;
  });

  readonly pastVacations = computed(() => {
    const result: { userId: number; vacation: Vacation }[] = [];
    const vacations = this.managerData().vacations;

    for (const [userId, userData] of Object.entries(vacations)) {
      userData.pastVacations.forEach((vacation) => {
        result.push({
          userId: Number(userId),
          vacation,
        });
      });
    }
    return result;
  });

  acceptVacation(vacationWithUser: VacationWithUser) {
    const { userId, vacation } = vacationWithUser;
    const userVacations = this.managerData().vacations[userId];
    if (!userVacations) return;

    this.http
      .put(`${this.baseUrl}/vacation/update/`, {
        userId,
        data: {
          futureVacations: userVacations.futureVacations.map((v) =>
            v.startDate === vacation.startDate &&
            v.description === vacation.description
              ? { ...v, status: 'accepted' }
              : v
          ),
          pastVacations: userVacations.pastVacations,
          remainingVacationDays:
            userVacations.remainingVacationDays -
            getDaysBetweenDates(
              new Date(vacation.startDate),
              new Date(vacation.endDate)
            ),
        },
      })
      .pipe(take(1))
      .subscribe({
        next: () => this.fetchManagerData(),
        error: (err) => this.routerService.navigate(['/error', err.status]),
      });
  }

  rejectVacation(vacationWithUser: VacationWithUser) {
    const { userId, vacation } = vacationWithUser;
    const userVacations = this.managerData().vacations[userId];
    if (!userVacations) return;

    this.http
      .put(`${this.baseUrl}/vacation/update/`, {
        userId,
        data: {
          futureVacations: userVacations.futureVacations.map((v) =>
            v.startDate === vacation.startDate &&
            v.description === vacation.description
              ? { ...v, status: 'rejected' }
              : v
          ),
          pastVacations: userVacations.pastVacations,
          remainingVacationDays: userVacations.remainingVacationDays,
        },
      })
      .pipe(take(1))
      .subscribe({
        next: () => this.fetchManagerData(),
        error: (err) => this.routerService.navigate(['/error', err.status]),
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
