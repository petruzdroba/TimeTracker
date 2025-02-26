import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-vacation-table',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './vacation-table.component.html',
  styleUrl: './vacation-table.component.sass',
})
export class VacationTableComponent {
  @Input({ required: true }) vacationList!: {
    date: Date;
    description: string;
  }[];
}
