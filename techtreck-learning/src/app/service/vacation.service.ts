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

  private vacationData = signal<VacationData>({
    vacations: [],
    remainingVacationDays: 0,
  });

  readonly vacations = computed(() => this.vacationData().vacations);
  readonly remainingDays = computed(
    () => this.vacationData().remainingVacationDays
  );

  loadVacations(): void {
    if (!this.userData.isLoggedIn()) return;

    this.http
      .get<Vacation[]>(
        `${environment.apiUrl}/vacations/${this.userData.user().id}`
      )
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.vacationData.update((data) => ({
            ...data,
            vacations: res,
          }));
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/error', err.status]);
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
          this.vacationData.update((data) => ({
            ...data,
            remainingVacationDays: res.remainingVacationDays,
          }));
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
          this.vacationData.update((data) => ({
            ...data,
            vacations: [...data.vacations, newVacation],
          }));
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
          this.vacationData.update((data) => ({
            ...data,
            vacations: data.vacations.map((v) =>
              v.id === vacationId ? updatedVacation : v
            ),
          }));
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
          this.vacationData.update((data) => ({
            ...data,
            vacations: data.vacations.filter((v) => v.id !== vacationId),
          }));
          this.loadRemainingDays();
        },
        error: (err) => {
          console.error(err);
          this.router.navigate(['/error', err.status]);
        },
      });
  }
}
