import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Vacation } from '../../../model/vacation.interface';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { VacationFormComponent } from '../vacation-form/vacation-form.component';
import { DateFilter } from '../../../model/date-filter.interface';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';
import { StatusFilter } from '../../../model/status-filter.interface';
import { StatusFilterComponent } from '../../../shared/status-filter/status-filter.component';

@Component({
  selector: 'app-vacation-table',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    EditBoxComponent,
    VacationFormComponent,
    DateFilterComponent,
    StatusFilterComponent,
  ],
  templateUrl: './vacation-table.component.html',
  styleUrl: './vacation-table.component.css',
})
export class VacationTableComponent {
  @Input({ required: true }) vacationList!: Vacation[];
  @Output() deleteVacation = new EventEmitter<number>();
  @Output() editVacation = new EventEmitter<[Vacation, Partial<Vacation>]>();

  protected editingVacation: Vacation | null = null;

  protected sortType: 'asc' | 'dsc' = 'asc';
  protected isOpen: boolean = false;
  protected selectedVacation: Vacation | null = null;
  private statusFilter: StatusFilter = { status: 'all' };
  private dateFilter: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };

  private get statusSortedList() {
    if (this.statusFilter.status === 'all') {
      return this.vacationList;
    }
    return this.vacationList.filter((vacation) => {
      return vacation.status === this.statusFilter.status;
    });
  }

  private get sortedVacationList() {
    return this.statusSortedList.sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      if (this.sortType === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }

  get list() {
    if (
      !this.dateFilter.startDate.getTime() &&
      !this.dateFilter.endDate.getTime()
    ) {
      return this.sortedVacationList;
    }
    return [
      ...this.sortedVacationList.filter((vacation) => {
        const dateA = new Date(vacation.startDate);
        const dateB = new Date(this.dateFilter.startDate);
        const dateC = new Date(this.dateFilter.endDate);
        if (
          dateA.getTime() >= dateB.getTime() &&
          dateA.getTime() < dateC.getTime() + 86400000
        ) {
          return true;
        }
        return false;
      }),
    ];
  }

  onChangeDateFilter(newDateFilter: DateFilter) {
    if (newDateFilter.startDate === null && newDateFilter.endDate === null) {
      this.dateFilter = {
        startDate: new Date(0),
        endDate: new Date(0),
      };
    } else {
      this.dateFilter = newDateFilter;
    }
  }

  onChangeStatusFilter(newStatusFilter: StatusFilter) {
    this.statusFilter.status = newStatusFilter.status;
  }

  get tableType(): 'future' | 'past' {
    if (this.list.length !== 0) {
      const today = new Date();
      const dateA = new Date(this.list[0].startDate);
      if (dateA < today) return 'past';
    }
    return 'future';
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

  onEdit(updatedVacation: [Vacation, Partial<Vacation>]) {
    this.editVacation.emit(updatedVacation);
    this.editingVacation = null;
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
