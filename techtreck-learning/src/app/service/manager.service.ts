import { inject, Injectable, signal, computed } from '@angular/core';
import { LeaveWithUser, ManagerData } from '../model/manager-data.interface';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take, firstValueFrom } from 'rxjs';
import { Vacation } from '../model/vacation.interface';
import { UserData } from '../model/user-data.interface';
import { LeaveSlip } from '../model/leave-slip.interface';
import { environment } from '../../environments/environment';

interface VacationWithUser {
  userId: number;
  vacation: Vacation;
}

@Injectable({ providedIn: 'root' })
export class ManagerService {
  private routerService = inject(Router);
  private http = inject(HttpClient);

  private pendingVacations = signal<Vacation[]>([]);
  private allVacations = signal<Vacation[]>([]);

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
        .get<Vacation[]>(`${environment.apiUrl}/vacation/status/PENDING`)
        .pipe(take(1))
        .subscribe({
          next: (vacations) => {
            this.pendingVacations.set(vacations);
          },
          error: (err) => {
            console.error('Error fetching pending vacations:', err);
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          }
        });

      this.http
        .get<Vacation[]>(`${environment.apiUrl}/vacation`)
        .pipe(take(1))
        .subscribe({
          next: (vacations) => {
            this.allVacations.set(vacations);
            resolve();
          },
          error: (err) => {
            console.error('Error fetching all vacations:', err);
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          }
        });

      this.managerData.set({
        vacations: {},
        leaves: {},
      });
    });
  }

  readonly futureVacations = computed(() => {
    const today = new Date();
    return this.pendingVacations()
      .filter(v => new Date(v.startDate) >= today)
      .map(vacation => ({
        userId: vacation.userId || 0,
        vacation
      }));
  });

  readonly pastVacations = computed(() => {
    return this.allVacations().map(vacation => ({
      userId: vacation.userId || 0,
      vacation
    }));
  });

  readonly futureLeaves = computed(() => {
    return [];
  });

  readonly pastLeaves = computed(() => {
    return [];
  });

  acceptVacation(vacationWithUser: VacationWithUser): Promise<void> {
    const { vacation } = vacationWithUser;

    if (!vacation.id) return Promise.reject('Vacation ID required');

    return new Promise((resolve, reject) => {
      this.http
        .put<Vacation>(`${environment.apiUrl}/vacation/${vacation.id}/ACCEPTED`, {})
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            console.error(err);
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  rejectVacation(vacationWithUser: VacationWithUser): Promise<void> {
    const { vacation } = vacationWithUser;

    if (!vacation.id) return Promise.reject('Vacation ID required');

    return new Promise((resolve, reject) => {
      this.http
        .put<Vacation>(`${environment.apiUrl}/vacation/${vacation.id}/DENIED`, {})
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            console.error(err);
            this.routerService.navigate(['/error', err.status]);
            reject(err);
          },
        });
    });
  }

  undoVacation(vacationWithUser: VacationWithUser): Promise<void> {
    const { vacation } = vacationWithUser;

    if (!vacation.id) return Promise.reject('Vacation ID required');

    return new Promise((resolve, reject) => {
      this.http
        .put<Vacation>(`${environment.apiUrl}/vacation/${vacation.id}/PENDING`, {})
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.fetchManagerData();
            resolve();
          },
          error: (err) => {
            console.error(err);
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
        .put(`${environment.apiUrl}/leaveslip/update/`, {
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
            console.error(err);
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
        .put(`${environment.apiUrl}/leaveslip/update/`, {
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
            console.error(err);
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
        .put(`${environment.apiUrl}/leaveslip/update/`, {
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
            console.error(err);
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
        this.http.get<UserData>(`${environment.apiUrl}/auth/getuser/${userId}/`)
      )
        .then((res) => {
          this.usersData.update((state) => ({ ...state, [userId]: res }));
          this.pendingRequests.delete(userId);
          return res;
        })
        .catch((err) => {
          console.error(err);
          this.routerService.navigate(['/error', err.status]);
          this.pendingRequests.delete(userId);
          throw err;
        });

      this.pendingRequests.set(userId, request);
    }

    return null;
  }

  getVacationIndex(vacationWithUser: VacationWithUser): number {
    return -1;
  }

  getLeaveIndex(leaveWithUser: LeaveWithUser): number {
    return -1;
  }
}
