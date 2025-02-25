import { Component, OnInit } from '@angular/core';
import { PastVacationTableComponent } from './past-vacation-table/past-vacation-table.component';

@Component({
  selector: 'app-vacation',
  standalone: true,
  imports: [PastVacationTableComponent],
  templateUrl: './vacation.component.html',
  styleUrl: './vacation.component.css',
})
export class VacationComponent implements OnInit {
  protected remainingVacationDays!: number;
  protected pastVacations: { date: Date; description: string }[] = [
    { date: new Date(), description: 'test' },
    { date: new Date(), description: 'Am fost sa fac ciorba!!!!' },
  ];

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
          this.remainingVacationDays = 14;
        }

        // if (storedRemainingVacationDaysObject.pastVacations) {
        //   this.pastVacations = storedRemainingVacationDaysObject.pastVacations;
        // } else {
        //   this.pastVacations = [];
        // }
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
