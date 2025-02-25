import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-past-vacation-table',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './past-vacation-table.component.html',
  styleUrl: './past-vacation-table.component.sass',
})
export class PastVacationTableComponent {
  @Input({ required: true }) pastVacations!: {
    date: Date;
    description: string;
  }[];
}
