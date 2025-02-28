import { Component, OnInit } from '@angular/core';
import { ResetVacationComponent } from './reset-vacation/reset-vacation.component';
import { VacationPickerComponent } from './vacation-picker/vacation-picker.component';
import { VacationTableComponent } from './vacation-table/vacation-table.component';
import { VacationProgressComponent } from './vacation-progress/vacation-progress.component';

interface Vacation {
  startDate: Date;
  endDate: Date;
  description: string;
}

@Component({
  selector: 'app-vacation',
  standalone: true,
  imports: [
    ResetVacationComponent,
    VacationPickerComponent,
    VacationTableComponent,
    VacationProgressComponent,
  ],
  templateUrl: './vacation.component.html',
  styleUrl: './vacation.component.css',
})
export class VacationComponent implements OnInit {
  protected remainingVacationDays!: number;
  protected pastVacations!: Vacation[];
  protected futureVacations!: Vacation[];
  protected tableShowToggle: 'past' | 'future' = 'future';

  ngOnInit(): void {
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

  onToggle() {
    this.tableShowToggle =
      this.tableShowToggle === 'future' ? 'past' : 'future';
  }

  addVacation(vacationData: Vacation) {
    this.futureVacations.push(vacationData);
    this.remainingVacationDays -= getDaysBetweenDates(
      vacationData.startDate,
      vacationData.endDate
    );
    this.updateVacationData();
  }

  deleteVacation(index: number, tableType: string) {
    if (tableType === 'future') {
      this.remainingVacationDays += getDaysBetweenDates(
        this.futureVacations[index].startDate,
        this.futureVacations[index].endDate
      );
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
