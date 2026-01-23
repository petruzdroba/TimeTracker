import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { Vacation } from '../model/vacation.interface';
import { UserDataService } from './user-data.service';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class VacationService {
  private userData = inject(UserDataService);
  private router = inject(Router);
  private http = inject(HttpClient);

  private futureVacations = signal<Vacation[]>([]);
  private pastVacations = signal<Vacation[]>([]);
  private remainingDaysSignal = signal<number>(0);

  readonly futureVacations$ = computed(() => this.futureVacations());
  readonly pastVacations$ = computed(() => this.pastVacations());
  readonly remainingDays = computed(() => this.remainingDaysSignal());
  readonly vacationData = computed(() => ({
    futureVacations: this.futureVacations(),
    pastVacations: this.pastVacations(),
    remainingVacationDays: this.remainingDaysSignal(),
  }));

  loadVacations(): void {
    if (!this.userData.isLoggedIn()) return;

    const userId = this.userData.user().id;

    this.http
      .get<Vacation[]>(`${environment.apiUrl}/vacation/user/${userId}/FUTURE`)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.futureVacations.set(res);
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/error', err.status]);
        },
      });

    this.http
      .get<Vacation[]>(`${environment.apiUrl}/vacation/user/${userId}/PAST`)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.pastVacations.set(res);
        },
        error: (err) => {
          console.error(err);
        },
      });

    this.loadRemainingDays();
  }

  private loadRemainingDays(): void {
    if (!this.userData.isLoggedIn()) return;

    this.http
      .get<number>(
        `${environment.apiUrl}/vacation/user/remaining/${this.userData.user().id}`,
      )
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.remainingDaysSignal.set(res);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  addVacation(vacation: Omit<Vacation, 'id'>): void {
    this.http
      .post<Vacation>(`${environment.apiUrl}/vacation`, {
        userId: this.userData.user().id,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        description: vacation.description,
      })
      .pipe(take(1))
      .subscribe({
        next: (newVacation) => {
          newVacation.userId = this.userData.user().id;
          this.futureVacations.update((vacations) => [
            ...vacations,
            newVacation,
          ]);
          this.loadRemainingDays();
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/error', err.status]);
        },
      });
  }

  updateVacation(vacation: Vacation): void {
    this.http
      .put<Vacation>(`${environment.apiUrl}/vacation`, {
        id: vacation.id,
        userId: this.userData.user().id,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
        description: vacation.description,
      })
      .pipe(take(1))
      .subscribe({
        next: (updatedVacation) => {
          this.futureVacations.update((vacations) =>
            vacations.map((v) => (v.id === vacation.id ? updatedVacation : v)),
          );
          this.loadRemainingDays();
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/error', err.status]);
        },
      });
  }

  deleteVacation(vacationId: number): void {
    this.http
      .delete<void>(`${environment.apiUrl}/vacation/${vacationId}`)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.futureVacations.update((vacations) =>
            vacations.filter((v) => v.id !== vacationId),
          );
          this.pastVacations.update((vacations) =>
            vacations.filter((v) => v.id !== vacationId),
          );
          this.loadRemainingDays();
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/error', err.status]);
        },
      });
  }
}
