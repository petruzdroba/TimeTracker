import { Component, inject, OnInit } from '@angular/core';
import { Vacation } from '../../model/vacation.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { DateFilter } from '../../model/date-filter.interface';
import { DateFilterComponent } from '../../shared/date-filter/date-filter.component';
import {
  getDaysBetweenDates,
  VacationService,
} from '../../service/vacation.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, CommonModule, DateFilterComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.sass',
})
export class AdminComponent implements OnInit {
  private vacationService = inject(VacationService);
  private dateFilterPending: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };

  private dateFilterCompleted: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };
  protected remainingVacationDays!: number;
  protected pastVacations!: Vacation[];
  protected futureVacations!: Vacation[];

  ngOnInit(): void {
    this.futureVacations = this.vacationService.getFutureVacations;
    this.pastVacations = this.vacationService.getPastVacations;
    this.remainingVacationDays = this.vacationService.getRemainingDays;
  }

  get completedVacationRequests() {
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

  get pendingVacationRequests() {
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

  getValidVacation(vacation: Vacation): boolean {
    return (
      this.vacationService.getRemainingDays >=
      getDaysBetweenDates(vacation.startDate, vacation.endDate)
    );
  }

  onAccept(vacation: Vacation) {
    if (
      this.vacationService.getRemainingDays >=
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
}
