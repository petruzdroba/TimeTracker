import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Vacation } from '../vacation.interface';

@Component({
  selector: 'app-vacation-table',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './vacation-table.component.html',
  styleUrl: './vacation-table.component.sass',
})
export class VacationTableComponent {
  @Input({ required: true }) vacationList!: Vacation[];
  @Output() deleteVacation = new EventEmitter<number>();
  protected sortType: 'asc' | 'dsc' = 'asc';

  get list() {
    return this.vacationList.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      if (this.sortType === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }

  onSortType() {
    this.sortType = this.sortType === 'asc' ? 'dsc' : 'asc';
  }

  onDelete(index: number) {
    this.deleteVacation.emit(index);
  }
}
