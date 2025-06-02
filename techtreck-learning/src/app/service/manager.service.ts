import { inject, Injectable, OnDestroy, signal, computed } from '@angular/core';
import { LeaveWithUser, ManagerData } from '../model/manager-data.interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take, map, firstValueFrom } from 'rxjs';
import { Vacation } from '../model/vacation.interface';
import { getDaysBetweenDates } from '../shared/utils/time.utils';
import { UserData } from '../model/user-data.interface';
import { LeaveSlip } from '../model/leave-slip.interface';

interface VacationWithUser {
  userId: number;
  vacation: Vacation;
}

@Injectable({ providedIn: 'root' })
export class ManagerService implements OnDestroy {
  private routerService = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000';
  private subscription: any;

  private managerData = signal<ManagerData>({
    vacations: {},
    leaves: {},
  });

  private usersData = signal<{ [key: number]: UserData }>({});
  private pendingRequests = new Map<number, Promise<UserData>>();

  constructor() {
    this.fetchManagerData();
  }

  initialize(): Promise<void> {
    return this.fetchManagerData();
  }

  private fetchManagerData(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http
        .get<{ vacations: any[]; leaves: any[] }>(
          this.baseUrl + '/manager/get/'
        )
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
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  readonly futureVacations = computed(() => {
    const result: { userId: number; vacation: Vacation }[] = [];
    const vacations = this.managerData().vacations;

    for (const [userId, userData] of Object.entries(vacations)) {
      if (userData && userData.futureVacations) {
        userData.futureVacations
          .filter((vacation) => vacation && Object.keys(vacation).length > 0)
          .forEach((vacation) => {
            result.push({
              userId: Number(userId),
              vacation,
            });
          });
      }
    }
    return result;
  });

  readonly pastVacations = computed(() => {
    const result: { userId: number; vacation: Vacation }[] = [];
    const vacations = this.managerData().vacations;

    for (const [userId, userData] of Object.entries(vacations)) {
      if (userData && userData.pastVacations) {
        userData.pastVacations
          .filter((vacation) => vacation && Object.keys(vacation).length > 0)
          .forEach((vacation) => {
            result.push({
              userId: Number(userId),
              vacation,
            });
          });
      }
    }
    return result;
  });

  readonly futureLeaves = computed(() => {
    const result: { userId: number; leave: LeaveSlip }[] = [];
    const leaves = this.managerData().leaves;

    for (const [userId, userData] of Object.entries(leaves)) {
      if (userData && userData.futureLeaves) {
        userData.futureLeaves
          .filter((leave) => leave && Object.keys(leave).length > 0)
          .forEach((leave) => {
            result.push({
              userId: Number(userId),
              leave,
            });
          });
      }
    }
    return result;
  });

  readonly pastLeaves = computed(() => {
    const result: { userId: number; leave: LeaveSlip }[] = [];
    const leaves = this.managerData().leaves;

    for (const [userId, userData] of Object.entries(leaves)) {
      if (userData && userData.pastLeaves) {
        userData.pastLeaves
          .filter((leave) => leave && Object.keys(leave).length > 0)
          .forEach((leave) => {
            result.push({
              userId: Number(userId),
              leave,
            });
          });
      }
    }
    return result;
  });

  acceptVacation(vacationWithUser: VacationWithUser): Promise<void> {
    const { userId, vacation } = vacationWithUser;
    const userVacations = this.managerData().vacations[userId];
    if (!userVacations) return Promise.reject();

    return new Promise((resolve, reject) => {
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
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  rejectVacation(vacationWithUser: VacationWithUser): Promise<void> {
    const { userId, vacation } = vacationWithUser;
    const userVacations = this.managerData().vacations[userId];
    if (!userVacations) return Promise.reject();

    return new Promise((resolve, reject) => {
      this.http
        .put(`${this.baseUrl}/vacation/update/`, {
          userId,
          data: {
            futureVacations: userVacations.futureVacations.map((v) =>
              v.startDate === vacation.startDate &&
              v.description === vacation.description
                ? { ...v, status: 'denied' }
                : v
            ),
            pastVacations: userVacations.pastVacations,
            remainingVacationDays: userVacations.remainingVacationDays,
          },
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  undoVacation(vacationWithUser: VacationWithUser): Promise<void> {
    const { userId, vacation } = vacationWithUser;
    const userVacations = this.managerData().vacations[userId];

    return new Promise((resolve, reject) => {
      this.http
        .put(this.baseUrl + '/vacation/update/', {
          userId,
          data: {
            futureVacations: userVacations.futureVacations.map((v) =>
              v.startDate === vacation.startDate &&
              v.description === vacation.description
                ? { ...v, status: 'pending' }
                : v
            ),
            pastVacations: userVacations.pastVacations,
            remainingVacationDays:
              vacation.status === 'accepted'
                ? userVacations.remainingVacationDays +
                  getDaysBetweenDates(
                    new Date(vacation.startDate),
                    new Date(vacation.endDate)
                  )
                : userVacations.remainingVacationDays,
          },
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  acceptLeave(leaveWithUser: LeaveWithUser): Promise<void> {
    const { userId, leave } = leaveWithUser;
    const userLeaves = this.managerData().leaves[userId];
    if (!userLeaves) return Promise.reject();

    return new Promise((resolve, reject) => {
      this.http
        .put(`${this.baseUrl}/leaveslip/update/`, {
          userId,
          data: {
            futureLeaves: userLeaves.futureLeaves.map((l) =>
              l.date === leave.date && l.description === leave.description
                ? { ...l, status: 'accepted' }
                : l
            ),
            pastLeaves: userLeaves.pastLeaves,
            remainingTime:
              userLeaves.remainingTime -
              Number(
                new Date(leave.endTime).getTime() -
                  new Date(leave.startTime).getTime()
              ),
          },
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  rejectLeave(leaveWithUser: LeaveWithUser): Promise<void> {
    const { userId, leave } = leaveWithUser;
    const userLeaves = this.managerData().leaves[userId];
    if (!userLeaves) return Promise.reject();

    return new Promise((resolve, reject) => {
      this.http
        .put(`${this.baseUrl}/leaveslip/update/`, {
          userId,
          data: {
            futureLeaves: userLeaves.futureLeaves.map((l) =>
              l.date === leave.date && l.description === leave.description
                ? { ...l, status: 'denied' }
                : l
            ),
            pastLeaves: userLeaves.pastLeaves,
            remainingTime: userLeaves.remainingTime,
          },
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  undoLeave(leaveWithUser: LeaveWithUser): Promise<void> {
    const { userId, leave } = leaveWithUser;
    const userLeaves = this.managerData().leaves[userId];
    if (!userLeaves) return Promise.reject();

    return new Promise((resolve, reject) => {
      this.http
        .put(`${this.baseUrl}/leaveslip/update/`, {
          userId,
          data: {
            futureLeaves: userLeaves.futureLeaves.map((l) =>
              l.date === leave.date && l.description === leave.description
                ? { ...l, status: 'pending' }
                : l
            ),
            pastLeaves: userLeaves.pastLeaves,
            remainingTime:
              leave.status === 'accepted'
                ? userLeaves.remainingTime +
                  Number(
                    new Date(leave.endTime).getTime() -
                      new Date(leave.startTime).getTime()
                  )
                : userLeaves.remainingTime,
          },
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  getRemainingDays(userId: number): number {
    const userVacations = this.managerData().vacations[userId];
    return userVacations ? userVacations.remainingVacationDays : 0;
  }

  getRemainingTime(userId: number): number {
    const userLeaves = this.managerData().leaves[userId];
    return userLeaves ? userLeaves.remainingTime : 0;
  }

  getUserById(userId: number): UserData | null {
    if (this.usersData()[userId]) {
      return this.usersData()[userId];
    }

    if (!this.pendingRequests.has(userId)) {
      const request = firstValueFrom(
        this.http.get<UserData>(`${this.baseUrl}/auth/getuser/${userId}/`)
      )
        .then((res) => {
          this.usersData.update((state) => ({ ...state, [userId]: res }));
          this.pendingRequests.delete(userId);
          return res;
        })
        .catch((err) => {
          this.routerService.navigate(['/error', err.status]);
          this.pendingRequests.delete(userId);
          throw err;
        });

      this.pendingRequests.set(userId, request);
    }

    return null;
  }

  getVacationIndex(vacationWithUser: VacationWithUser): number {
    const { userId, vacation } = vacationWithUser;
    return this.managerData().vacations[userId]?.futureVacations.findIndex(
      (v) => v === vacation
    );
  }

  getLeaveIndex(leaveWithUser: LeaveWithUser): number {
    const { userId, leave } = leaveWithUser;
    return this.managerData().leaves[userId]?.futureLeaves.findIndex(
      (l) => l === leave
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
