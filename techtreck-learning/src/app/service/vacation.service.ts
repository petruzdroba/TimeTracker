import {
  computed,
  effect,
  inject,
  Injectable,
  OnDestroy,
  signal,
} from '@angular/core';
import { Vacation } from '../model/vacation.interface';
import { VacationData } from '../model/vacation-data.interface';
import { getDaysBetweenDates } from '../shared/utils/time.utils';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { UserDataService } from './user-data.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class VacationService implements OnDestroy {
  private userData = inject(UserDataService);
  private routerService = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000';
  private subscription: any;

  private vacationData = signal<VacationData>({
    futureVacations: [],
    pastVacations: [],
    remainingVacationDays: 14,
  });
  constructor() {
    effect(
      () => {
        this.initialize();
      },
      { allowSignalWrites: true }
    );
  }

  initialize(): void {
    if (this.userData.isLoggedIn()) {
      this.http
        .get<VacationData>(
          `${this.baseUrl}/vacation/get/${this.userData.user().id}/`
        )
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            const processedData = this.processExpiredVacations(res);
            this.vacationData.set({
              ...processedData,
              futureVacations:
                Array.isArray(processedData.futureVacations) &&
                !(
                  processedData.futureVacations.length === 1 &&
                  Object.keys(processedData.futureVacations[0]).length === 0
                )
                  ? processedData.futureVacations
                  : [],
              pastVacations:
                Array.isArray(processedData.pastVacations) &&
                !(
                  processedData.pastVacations.length === 1 &&
                  Object.keys(processedData.pastVacations[0]).length === 0
                )
                  ? processedData.pastVacations
                  : [],
            });
            this.updateVacationData();
          },
          error: (err) => {
            console.error('Error fetching vacation data:', err);
            // this.updateVacationData();
          },
        });
    }
  }

  private processExpiredVacations(data: VacationData): VacationData {
    const today = new Date();
    let futureVacations = data.futureVacations || [];
    let pastVacations = data.pastVacations || [];

    futureVacations = futureVacations.filter((vacation) => {
      if (new Date(vacation.startDate) <= today) {
        if (vacation.status === 'pending') {
          vacation.status = 'ignored';
        }
        pastVacations.push(vacation);
        return false; // Remove from future
      }
      return true; // Keep in future
    });

    return {
      futureVacations,
      pastVacations,
      remainingVacationDays: data.remainingVacationDays || 0,
    };
  }

  readonly _futureVacations = computed(
    () => this.vacationData().futureVacations
  );
  readonly _pastVacations = computed(() => this.vacationData().pastVacations);
  readonly _remainingDays = computed(
    () => this.vacationData().remainingVacationDays
  );
  readonly _vacationData = computed(() => this.vacationData());

  get futureVacations() {
    return this._futureVacations();
  }

  get pastVacations() {
    return this._pastVacations();
  }

  get remainingDays() {
    return this._remainingDays();
  }

  get vacation(): VacationData {
    return this._vacationData();
  }

  getVacationIndex(vacation: Vacation): number {
    return this.vacationData().futureVacations.findIndex(
      (vacations) => vacation === vacations
    );
  }

  addVacation(vacationData: Vacation) {
    this.vacationData.update((currentData) => ({
      ...currentData,
      futureVacations: [...currentData.futureVacations, vacationData],
    }));
    this.updateVacationData();
  }

  deleteVacation(index: number, tableType: string) {
    if (tableType === 'future') {
      this.restoreVacationDays(index);
    }

    this.vacationData.update((currentData) => ({
      ...currentData,
      [tableType === 'future' ? 'futureVacations' : 'pastVacations']: [
        ...currentData[
          tableType === 'future' ? 'futureVacations' : 'pastVacations'
        ].slice(0, index),
        ...currentData[
          tableType === 'future' ? 'futureVacations' : 'pastVacations'
        ].slice(index + 1),
      ],
    }));
    this.updateVacationData();
  }

  restoreVacationDays(index: number) {
    this.vacationData.update((currentData) => {
      if (currentData.futureVacations[index].status === 'accepted') {
        return {
          ...currentData,
          remainingVacationDays:
            currentData.remainingVacationDays +
            getDaysBetweenDates(
              currentData.futureVacations[index].startDate,
              currentData.futureVacations[index].endDate
            ),
        };
      }
      return currentData;
    });
  }

  editVacation(oldVacation: Vacation, newVacationData: Vacation) {
    this.vacationData.update((currentData) => {
      const index = currentData.futureVacations.findIndex(
        (vacation) =>
          new Date(vacation.startDate).getTime() ===
            new Date(oldVacation.startDate).getTime() &&
          vacation.description === oldVacation.description
      );

      if (index === -1) return currentData;

      const oldVacationDays = getDaysBetweenDates(
        currentData.futureVacations[index].startDate,
        currentData.futureVacations[index].endDate
      );

      return {
        ...currentData,
        futureVacations: currentData.futureVacations.map((vacation, i) =>
          i === index ? { ...newVacationData, status: 'pending' } : vacation
        ),
        remainingVacationDays:
          currentData.futureVacations[index].status === 'accepted'
            ? currentData.remainingVacationDays + oldVacationDays
            : currentData.remainingVacationDays,
      };
    });

    this.updateVacationData();
  }

  updateVacationData() {
    if (this.userData.isLoggedIn()) {
      this.subscription = this.http
        .put(`${this.baseUrl}/vacation/update/`, {
          userId: this.userData.user().id,
          data: {
            futureVacations: this.vacationData().futureVacations,
            pastVacations: this.vacationData().pastVacations,
            remainingVacationDays: this.vacationData().remainingVacationDays,
          },
        })
        .subscribe({
          next: (res) => {},
          error: (err) => {
            this.routerService.navigate(['/error', err.status]);
          },
        });
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
