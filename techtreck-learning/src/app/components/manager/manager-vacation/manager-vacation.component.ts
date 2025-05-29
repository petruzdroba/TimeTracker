import { Vacation } from './../../../model/vacation.interface';
import { Component, inject, OnInit } from '@angular/core';
import { ManagerService } from '../../../service/manager.service';
import { VacationWithUser } from '../../../model/manager-data.interface';
import { DateFilter } from '../../../model/date-filter.interface';
import { StatusFilter } from '../../../model/status-filter.interface';
import { CommonModule } from '@angular/common';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';
import { StatusFilterComponent } from '../../../shared/status-filter/status-filter.component';
import { getDaysBetweenDates } from '../../../shared/utils/time.utils';

@Component({
  selector: 'app-manager-vacation',
  standalone: true,
  imports: [CommonModule, DateFilterComponent, StatusFilterComponent],
  templateUrl: './manager-vacation.component.html',
  styleUrl: './manager-vacation.component.sass',
})
export class ManagerVacationComponent implements OnInit {
  private managerService = inject(ManagerService);
  futureVacations: VacationWithUser[] = [];
  pastVacations: VacationWithUser[] = [];

  private dateFilterPending: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };

  private dateFilterCompleted: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };
  private statusFilter: StatusFilter = { status: 'all' };

  async ngOnInit(): Promise<void> {
    await this.managerService.initialize();
    this.futureVacations = this.managerService.futureVacations();
    this.pastVacations = this.managerService.pastVacations();
  }

  private get completedVacationRequests() {
    return [
      ...this.pastVacations.filter((v) => v.vacation.status !== 'pending'),
      ...this.futureVacations.filter((v) => v.vacation.status !== 'pending'),
    ];
  }

  private get statusFiltered() {
    if (this.statusFilter.status === 'all')
      return this.completedVacationRequests;
    else {
      return this.completedVacationRequests.filter((v) => {
        return v.vacation.status === this.statusFilter.status;
      });
    }
  }

  get filteredCompletedVacationRequests() {
    if (
      !this.dateFilterCompleted.startDate.getTime() &&
      !this.dateFilterCompleted.endDate.getTime()
    ) {
      return this.statusFiltered;
    }
    return [
      ...this.statusFiltered.filter((v) => {
        const dateA = new Date(v.vacation.startDate);
        const dateB = new Date(this.dateFilterCompleted.startDate);
        const dateC = new Date(this.dateFilterCompleted.endDate);
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

  private get pendingVacationRequests() {
    return [
      ...this.futureVacations.filter((v) => v.vacation.status === 'pending'),
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
      ...this.pendingVacationRequests.filter((v) => {
        const dateA = new Date(v.vacation.startDate);
        const dateB = new Date(this.dateFilterPending.startDate);
        const dateC = new Date(this.dateFilterPending.endDate);
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

  onChangeStatusFilter(newStatusFilter: StatusFilter) {
    this.statusFilter.status = newStatusFilter.status;
  }

  getValidVacation(vacationWithUser: VacationWithUser): boolean {
    const userVacations = this.managerService.getRemainingDays(
      vacationWithUser.userId
    );
    if (!userVacations) return false;

    return (
      userVacations >=
      getDaysBetweenDates(
        new Date(vacationWithUser.vacation.startDate),
        new Date(vacationWithUser.vacation.endDate)
      )
    );
  }

  async onAccept(v: VacationWithUser) {
    await this.managerService.acceptVacation(v);
    await this.managerService.initialize();
    this.futureVacations = this.managerService.futureVacations();
    this.pastVacations = this.managerService.pastVacations();
  }

  async onDeny(v: VacationWithUser) {
    await this.managerService.rejectVacation(v);
    await this.managerService.initialize();
    this.futureVacations = this.managerService.futureVacations();
    this.pastVacations = this.managerService.pastVacations();
  }
}
