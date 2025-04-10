import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Vacation } from '../../../model/vacation.interface';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { VacationFormComponent } from '../vacation-form/vacation-form.component';

@Component({
  selector: 'app-vacation-table',
  standalone: true,
  imports: [DatePipe, CommonModule, EditBoxComponent, VacationFormComponent],
  templateUrl: './vacation-table.component.html',
  styleUrl: './vacation-table.component.sass',
})
export class VacationTableComponent {
  @Input({ required: true }) vacationList!: Vacation[];
  @Output() deleteVacation = new EventEmitter<number>();
  @Output() editVacation = new EventEmitter<Vacation>();
  protected sortType: 'asc' | 'dsc' = 'asc';
  protected isOpen: boolean = false;
  protected selectedVacation: Vacation | null = null;

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

  disabledEdit(vacation: Vacation): boolean {
    const dateA = new Date(vacation.startDate);
    const dateB = new Date();
    return dateA.getTime() < dateB.getTime();
  }

  onSortType() {
    this.sortType = this.sortType === 'asc' ? 'dsc' : 'asc';
  }

  onDelete(index: number) {
    this.deleteVacation.emit(index);
  }

  openEditWindow(vacation: Vacation) {
    this.isOpen = true;
    this.selectedVacation = vacation;
  }

  closeEditWindow() {
    this.isOpen = false;
    this.selectedVacation = null;
  }
}
