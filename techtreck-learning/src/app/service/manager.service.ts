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
          },
        });

      this.managerData.set({
        vacations: {},
        leaves: {},
      });
    });
  }

  readonly pendingVacationsComputed = computed(() => {
    return this.allVacations()
      .filter((v) => v.status === 'PENDING')
      .map((vacation) => ({
        userId: vacation.userId!,
        vacation,
      }));
  });

  readonly completedVacationsComputed = computed(() => {
    return this.allVacations()
      .filter((v) => v.status !== 'PENDING')
      .map((vacation) => ({
        userId: vacation.userId!,
        vacation,
      }));
  });

  readonly futureLeaves = computed(() => []);
  readonly pastLeaves = computed(() => []);

  acceptVacation(vacationWithUser: VacationWithUser): Promise<void> {
    return this.updateVacationStatus(vacationWithUser, 'ACCEPTED');
  }

  rejectVacation(vacationWithUser: VacationWithUser): Promise<void> {
    return this.updateVacationStatus(vacationWithUser, 'DENIED');
  }

  undoVacation(vacationWithUser: VacationWithUser): Promise<void> {
    return this.updateVacationStatus(vacationWithUser, 'PENDING');
  }

  private updateVacationStatus(
    vacationWithUser: VacationWithUser,
    status: string,
  ): Promise<void> {
    const { vacation } = vacationWithUser;
    if (!vacation.id) return Promise.reject('Vacation ID required');

    return new Promise((resolve, reject) => {
      this.http
        .put<Vacation>(
          `${environment.apiUrl}/vacation/${vacation.id}/${status}`,
          {},
        )
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
    return this.updateLeaveStatus(leaveWithUser, 'accepted');
  }

  rejectLeave(leaveWithUser: LeaveWithUser): Promise<void> {
    return this.updateLeaveStatus(leaveWithUser, 'denied');
  }

  undoLeave(leaveWithUser: LeaveWithUser): Promise<void> {
    return this.updateLeaveStatus(leaveWithUser, 'pending');
  }

  private updateLeaveStatus(
    leaveWithUser: LeaveWithUser,
    status: 'accepted' | 'denied' | 'pending',
  ): Promise<void> {
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
                ? { ...l, status }
                : l,
            ),
            pastLeaves: userLeaves.pastLeaves,
            remainingTime:
              status === 'accepted' && leave.status === 'pending'
                ? userLeaves.remainingTime -
                  (new Date(leave.endTime).getTime() -
                    new Date(leave.startTime).getTime())
                : status === 'pending' && leave.status === 'accepted'
                  ? userLeaves.remainingTime +
                    (new Date(leave.endTime).getTime() -
                      new Date(leave.startTime).getTime())
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

  getRemainingDays(userId: number): Promise<number> {
    return firstValueFrom(
      this.http.get<number>(
        `${environment.apiUrl}/vacation/user/remaining/${userId}`,
      ),
    );
  }

  getRemainingTime(userId: number): number {
    const userLeaves = this.managerData().leaves[userId];
    return userLeaves ? userLeaves.remainingTime : 0;
  }

  getUserById(userId: number): UserData | null {
    if (this.usersData()[userId]) return this.usersData()[userId];

    if (!this.pendingRequests.has(userId)) {
      const request = firstValueFrom(
        this.http.get<UserData>(`${environment.apiUrl}/user/${userId}`),
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
    return -1;
  }

  getLeaveIndex(leaveWithUser: LeaveWithUser): number {
    return -1;
  }
}
