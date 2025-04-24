import { computed, Injectable, signal } from '@angular/core';
import { Vacation } from '../model/vacation.interface';
import { VacationData } from '../model/vacation-data.interface';
import { getDaysBetweenDates } from '../shared/utils/time.utils';

@Injectable({ providedIn: 'root' })
export class VacationService {
  private vacationData = signal<VacationData>({
    futureVacations: [],
    pastVacations: [],
    remainingVacationDays: 14,
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const storedVacationData = window.localStorage.getItem('vacationData');
      if (storedVacationData) {
        const data = JSON.parse(storedVacationData);
        const processedData = this.processExpiredVacations(data);
        this.vacationData.set(processedData);
        this.updateVacationData();
      }
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

  updateVacationData() {
    window.localStorage.setItem(
      'vacationData',
      JSON.stringify(this.vacationData())
    );
  }

  getVacationIndex(vacation: Vacation): number {
    return this.vacationData().futureVacations.findIndex(
      (vacations) => vacation === vacations
    );
  }

  addVacation(vacationData: Vacation) {
    this.acceptedVacation(vacationData);
    this.vacationData.update((currentData) => ({
      ...currentData,
      futureVacations: [...currentData.futureVacations, vacationData],
    }));
    this.updateVacationData();
  }

  acceptedVacation(vacationData: Vacation) {
    if (vacationData.status === 'accepted') {
      this.vacationData.update((currentData) => ({
        ...currentData,
        remainingVacationDays:
          currentData.remainingVacationDays -
          getDaysBetweenDates(vacationData.startDate, vacationData.endDate),
      }));
      this.updateVacationData();
    }
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

  modifyStatus(index: number, newStatus: 'pending' | 'accepted' | 'denied') {
    this.vacationData.update((currentData) => {
      const updatedVacations = [...currentData.futureVacations];
      updatedVacations[index] = {
        ...updatedVacations[index],
        status: newStatus,
      };

      return {
        ...currentData,
        futureVacations: updatedVacations,
      };
    });
    this.updateVacationData();
  }

  resetData() {
    this.vacationData.set({
      remainingVacationDays: 14,
      pastVacations: [],
      futureVacations: [],
    });
    this.updateVacationData();
    window.location.reload();
  }
}
