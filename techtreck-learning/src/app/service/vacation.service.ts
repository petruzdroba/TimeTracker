import { computed, inject, Injectable, signal } from '@angular/core';
import { Vacation } from '../model/vacation.interface';
import { VacationData } from '../model/vacation-data.interface';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
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
      .get<Vacation[]>(`${environment.apiUrl}/vacations/${userId}/future`)
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
      .get<Vacation[]>(`${environment.apiUrl}/vacations/${userId}/past`)
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
      .get<{ remainingVacationDays: number }>(
        `${environment.apiUrl}/vacations/${this.userData.user().id}/remaining`
      )
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.remainingDaysSignal.set(res.remainingVacationDays);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  addVacation(vacation: Omit<Vacation, 'id'>): void {
    this.http
      .post<Vacation>(`${environment.apiUrl}/vacations`, {
        ...vacation,
        userId: this.userData.user().id,
      })
      .pipe(take(1))
      .subscribe({
        next: (newVacation) => {
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

  updateVacation(vacationId: number, updates: Partial<Vacation>): void {
    this.http
      .put<Vacation>(`${environment.apiUrl}/vacations/${vacationId}`, updates)
      .pipe(take(1))
      .subscribe({
        next: (updatedVacation) => {
          this.futureVacations.update((vacations) =>
            vacations.map((v) => (v.id === vacationId ? updatedVacation : v))
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
      .delete<void>(`${environment.apiUrl}/vacations/${vacationId}`)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.futureVacations.update((vacations) =>
            vacations.filter((v) => v.id !== vacationId)
          );
          this.pastVacations.update((vacations) =>
            vacations.filter((v) => v.id !== vacationId)
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
