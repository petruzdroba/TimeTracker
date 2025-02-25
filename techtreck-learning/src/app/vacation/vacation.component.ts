import { Component, OnInit } from '@angular/core';
import { PastVacationTableComponent } from './past-vacation-table/past-vacation-table.component';
import { ResetVacationComponent } from './reset-vacation/reset-vacation.component';

@Component({
  selector: 'app-vacation',
  standalone: true,
  imports: [PastVacationTableComponent, ResetVacationComponent],
  templateUrl: './vacation.component.html',
  styleUrl: './vacation.component.css',
})
export class VacationComponent implements OnInit {
  protected remainingVacationDays!: number;
  protected pastVacations!: { date: Date; description: string }[];

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
      }
    }
  }

  updateVacationData() {
    window.localStorage.setItem(
      'vacationData',
      JSON.stringify({
        remainingVacationDays: this.remainingVacationDays,
        pastVacations: this.pastVacations,
      })
    );
  }
}
