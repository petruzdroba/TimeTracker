import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { VacationService } from '../../../service/vacation.service';
import { DateFilter } from '../../../model/date-filter.interface';
import { Vacation } from '../../../model/vacation.interface';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';
import { CommonModule, DatePipe } from '@angular/common';
import { getDaysBetweenDates } from '../../../shared/utils/time.utils';

@Component({
  selector: 'app-admin-vacation',
  standalone: true,
  imports: [DateFilterComponent, DatePipe, CommonModule],
  templateUrl: './admin-vacation.component.html',
  styleUrl: './admin-vacation.component.sass',
})
export class AdminVacationComponent implements OnInit {
  private vacationService = inject(VacationService);
  @Output() switchListEvent = new EventEmitter<void>();
  private dateFilterPending: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };

  private dateFilterCompleted: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };
  protected pastVacations!: Vacation[];
  protected futureVacations!: Vacation[];

  ngOnInit(): void {
    this.futureVacations = this.vacationService.futureVacations;
    this.pastVacations = this.vacationService.pastVacations;
  }

  private get completedVacationRequests() {
    return [
      ...this.pastVacations.filter((vacation) => vacation.status !== 'pending'),
      ...this.futureVacations.filter(
        (vacation) => vacation.status !== 'pending'
      ),
    ];
  }

  get filteredCompletedVacationRequests() {
    if (
      !this.dateFilterCompleted.startDate.getTime() &&
      !this.dateFilterCompleted.endDate.getTime()
    ) {
      return this.completedVacationRequests;
    }
    return [
      ...this.completedVacationRequests.filter((vacation) => {
        const dateA = new Date(vacation.startDate);
        const dateB = new Date(this.dateFilterCompleted.startDate);
        const dateC = new Date(this.dateFilterCompleted.endDate);
        if (
          dateA.getTime() >= dateB.getTime() &&
          dateA.getTime() <= dateC.getTime() + 86400000
        ) {
          return true;
        }
        return false;
      }),
    ];
  }

  private get pendingVacationRequests() {
    return [
      ...this.futureVacations.filter(
        (vacation) => vacation.status === 'pending'
      ),
    ];
  }

  get filteredPendingVacationRequests() {
    if (
      !this.dateFilterPending.startDate.getTime() &&
      !this.dateFilterPending.endDate.getTime()
    ) {
      return this.pendingVacationRequests;
    }
    return [
      ...this.pendingVacationRequests.filter((vacation) => {
        const dateA = new Date(vacation.startDate);
        const dateB = new Date(this.dateFilterPending.startDate);
        const dateC = new Date(this.dateFilterPending.endDate);
        if (
          dateA.getTime() >= dateB.getTime() &&
          dateA.getTime() <= dateC.getTime() + 86400000
        ) {
          return true;
        }
        return false;
      }),
    ];
  }

  disabled(vacation: Vacation): boolean {
    const index = this.vacationService.getVacationIndex(vacation);
    return index === -1;
  }

  onUndo(leave: Vacation) {
    const index = this.vacationService.getVacationIndex(leave);
    if (index !== -1) {
      this.vacationService.restoreVacationDays(index);
      leave.status = 'pending';
      this.vacationService.updateVacationData();
    }
  }

  getValidVacation(vacation: Vacation): boolean {
    return (
      this.vacationService.remainingDays >=
      getDaysBetweenDates(vacation.startDate, vacation.endDate)
    );
  }

  onAccept(vacation: Vacation) {
    if (
      this.vacationService.remainingDays >=
      getDaysBetweenDates(vacation.startDate, vacation.endDate)
    ) {
      vacation.status = 'accepted';
      this.vacationService.acceptedVacation(vacation);
      this.vacationService.updateVacationData();
    }
  }

  onDeny(vacation: Vacation) {
    vacation.status = 'denied';
    this.vacationService.updateVacationData();
  }

  onChangeDateFilterPending(newDateFilter: DateFilter) {
    if (newDateFilter.startDate === null && newDateFilter.endDate === null) {
      this.dateFilterPending = {
        startDate: new Date(0),
        endDate: new Date(0),
      };
    } else {
      this.dateFilterPending = newDateFilter;
    }
  }

  onChangeDateFilterCompleted(newDateFilter: DateFilter) {
    if (newDateFilter.startDate === null && newDateFilter.endDate === null) {
      this.dateFilterCompleted = {
        startDate: new Date(0),
        endDate: new Date(0),
      };
    } else {
      this.dateFilterCompleted = newDateFilter;
    }
  }

  onToggleList() {
    this.switchListEvent.emit();
  }
}
