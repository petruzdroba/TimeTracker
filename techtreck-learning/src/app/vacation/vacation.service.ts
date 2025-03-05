import { Injectable } from '@angular/core';
import { Vacation } from './vacation.interface';

@Injectable({ providedIn: 'root' })
export class VacationService {
  private futureVacations: Vacation[] = [];
  private pastVacations: Vacation[] = [];
  private remainingVacationDays: number = 0;

  get getFutureVacations() {
    return this.futureVacations;
  }

  get getPastVacations() {
    return this.pastVacations;
  }

  get getRemainingDays() {
    return this.remainingVacationDays;
  }

  initVacationsData() {
    if (typeof window !== 'undefined') {
      const storedVacationData = window.localStorage.getItem('vacationData');

      if (storedVacationData) {
        const storedVacationDataObject = JSON.parse(storedVacationData);

        if (storedVacationDataObject.remainingVacationDays) {
          this.remainingVacationDays =
            storedVacationDataObject.remainingVacationDays;
        } else {
          this.remainingVacationDays = 0;
        }

        if (storedVacationDataObject.futureVacations) {
          this.futureVacations = storedVacationDataObject.futureVacations;
        } else {
          this.futureVacations = [];
        }

        if (storedVacationDataObject.pastVacations) {
          this.pastVacations = storedVacationDataObject.pastVacations;
          const today = new Date();

          this.futureVacations = this.futureVacations.filter((vacation) => {
            if (new Date(vacation.endDate) <= today) {
              this.pastVacations.push(vacation);
              return false; // Remove
            }
            return true; // Keep
          });
          this.updateVacationData();
        } else {
          this.pastVacations = [];
        }
      }
    }
  }

  updateVacationData() {
    window.localStorage.setItem(
      'vacationData',
      JSON.stringify({
        remainingVacationDays: this.remainingVacationDays,
        pastVacations: this.pastVacations,
        futureVacations: this.futureVacations,
      })
    );
  }

  addVacation(vacationData: Vacation) {
    this.futureVacations.push(vacationData);
    this.acceptedVacation(vacationData);
    this.updateVacationData();
  }

  acceptedVacation(vacationData: Vacation) {
    if (vacationData.status === 'accepted') {
      this.remainingVacationDays -= getDaysBetweenDates(
        vacationData.startDate,
        vacationData.endDate
      );
    }
  }

  deleteVacation(index: number, tableType: string) {
    if (tableType === 'future') {
      this.restoreVacationDays(index);
      //since vacation day is in the future, removing them should restore remaining vacation days
      this.futureVacations = [
        ...this.futureVacations.slice(0, index),
        ...this.futureVacations.slice(index + 1),
      ];
    } else {
      this.pastVacations = [
        ...this.pastVacations.slice(0, index),
        ...this.pastVacations.slice(index + 1),
      ];
    }
    this.updateVacationData();
  }

  restoreVacationDays(index: number) {
    if (this.futureVacations[index].status === 'accepted') {
      this.remainingVacationDays += getDaysBetweenDates(
        this.futureVacations[index].startDate,
        this.futureVacations[index].endDate
      );
    }
  }

  modifyStatus(index: number, newStatus: 'pending' | 'accepted' | 'denied') {
    this.futureVacations[index].status = newStatus;
    this.updateVacationData();
  }
}

function getDaysBetweenDates(startDate: Date, endDate: Date): number {
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
