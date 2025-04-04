import { computed, Injectable, signal } from '@angular/core';
import { Vacation } from '../model/vacation.interface';
import { VacationData } from '../model/vacation-data.interface';

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

  get futureVacations() {
    return this._futureVacations();
  }

  get pastVacations() {
    return this._pastVacations();
  }

  get remainingDays() {
    return this._remainingDays();
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
    const currentData = this.vacationData();
    currentData.futureVacations.push(vacationData);
    this.acceptedVacation(vacationData);
    this.vacationData.set(currentData);
    this.updateVacationData();
  }

  acceptedVacation(vacationData: Vacation) {
    if (vacationData.status === 'accepted') {
      const currentData = this.vacationData();
      currentData.remainingVacationDays -= getDaysBetweenDates(
        vacationData.startDate,
        vacationData.endDate
      );
      this.vacationData.set(currentData);
    }
  }

  deleteVacation(index: number, tableType: string) {
    const currentData = this.vacationData();
    if (tableType === 'future') {
      this.restoreVacationDays(index);
      currentData.futureVacations = [
        ...currentData.futureVacations.slice(0, index),
        ...currentData.futureVacations.slice(index + 1),
      ];
    } else {
      currentData.pastVacations = [
        ...currentData.pastVacations.slice(0, index),
        ...currentData.pastVacations.slice(index + 1),
      ];
    }
    this.vacationData.set(currentData);
    this.updateVacationData();
  }

  restoreVacationDays(index: number) {
    const currentData = this.vacationData();
    if (currentData.futureVacations[index].status === 'accepted') {
      currentData.remainingVacationDays += getDaysBetweenDates(
        currentData.futureVacations[index].startDate,
        currentData.futureVacations[index].endDate
      );
      this.vacationData.set(currentData);
    }
  }

  modifyStatus(index: number, newStatus: 'pending' | 'accepted' | 'denied') {
    const currentData = this.vacationData();
    currentData.futureVacations[index].status = newStatus;
    this.vacationData.set(currentData);
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

export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}
