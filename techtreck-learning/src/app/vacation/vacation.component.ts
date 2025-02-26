import { Component, OnInit } from '@angular/core';
import { ResetVacationComponent } from './reset-vacation/reset-vacation.component';
import { VacationPickerComponent } from './vacation-picker/vacation-picker.component';
import { VacationTableComponent } from './vacation-table/vacation-table.component';

interface Vacation {
  date: Date;
  description: string;
}

@Component({
  selector: 'app-vacation',
  standalone: true,
  imports: [
    ResetVacationComponent,
    VacationPickerComponent,
    VacationTableComponent,
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
      const storedRemainingVacationDaysString =
        window.localStorage.getItem('vacationData');

      if (storedRemainingVacationDaysString) {
        const storedRemainingVacationDaysObject = JSON.parse(
          storedRemainingVacationDaysString
        );

        if (storedRemainingVacationDaysObject.remainingVacationDays) {
          this.remainingVacationDays =
            storedRemainingVacationDaysObject.remainingVacationDays;
        } else {
          this.remainingVacationDays = 0;
        }

        if (storedRemainingVacationDaysObject.pastVacations) {
          this.pastVacations = storedRemainingVacationDaysObject.pastVacations;
        } else {
          this.pastVacations = [];
        }

        if (storedRemainingVacationDaysObject.futureVacations) {
          this.futureVacations =
            storedRemainingVacationDaysObject.futureVacations;
        } else {
          this.futureVacations = [];
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
    console.log(this.tableShowToggle);
  }
}
