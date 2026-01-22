import { Vacation } from './../../../model/vacation.interface';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
  styleUrl: './manager-vacation.component.css',
})
export class ManagerVacationComponent implements OnInit {
  private managerService = inject(ManagerService);
  private cdr = inject(ChangeDetectorRef);

  pendingVacations: VacationWithUser[] = [];
  completedVacations: VacationWithUser[] = [];

  private userEmailCache = new Map<number, string>();
  private remainingDaysCache = new Map<number, number>();
  private validVacationCache = new Map<string, boolean>();

  private dateFilterPending: DateFilter = { startDate: new Date(0), endDate: new Date(0) };
  private dateFilterCompleted: DateFilter = { startDate: new Date(0), endDate: new Date(0) };
  private statusFilter: StatusFilter = { status: 'all' };

  async ngOnInit(): Promise<void> {
    await this.managerService.initialize();
    // this.pendingVacations = this.managerService.pendingVacationsComputed();
    // this.completedVacations = this.managerService.completedVacationsComputed();
    // console.log(this.pendingVacations)
    await this.refreshVacations();

    await this.preloadUserData();
  }

  private async preloadUserData() {
    const allVacations = [...this.pendingVacations, ...this.completedVacations];
    const userIds = new Set(allVacations.map(v => v.userId));

    for (const userId of userIds) {
      if (!this.userEmailCache.has(userId)) {
        const user = this.managerService.getUserById(userId);
        if (user) {
          this.userEmailCache.set(userId, user.email);
        }
      }
    }

    for (const v of this.pendingVacations) {
      if (!this.remainingDaysCache.has(v.userId)) {
        try {
          const remaining = await this.managerService.getRemainingDays(v.userId);
          this.remainingDaysCache.set(v.userId, remaining);

          const days = getDaysBetweenDates(
            new Date(v.vacation.startDate),
            new Date(v.vacation.endDate)
          );
          const cacheKey = `${v.userId}-${v.vacation.id}`;
          this.validVacationCache.set(cacheKey, remaining >= days);
        } catch (err) {
          console.error('Error fetching remaining days:', err);
        }
      }
    }

    this.cdr.markForCheck();
  }

  private get statusFilteredCompleted() {
    if (this.statusFilter.status === 'all') return this.completedVacations;
    return this.completedVacations.filter(v => v.vacation.status === this.statusFilter.status);
  }

  get filteredCompletedVacationRequests() {
    const filtered = this.statusFilteredCompleted;
    if (!this.dateFilterCompleted.startDate.getTime() && !this.dateFilterCompleted.endDate.getTime()) {
      return filtered;
    }
    return filtered.filter(v => {
      const start = new Date(v.vacation.startDate).getTime();
      const from = this.dateFilterCompleted.startDate.getTime();
      const to = this.dateFilterCompleted.endDate.getTime() + 86400000; // include end date
      return start >= from && start < to;
    });
  }

  private get pendingVacationRequests() {
    return this.pendingVacations.filter(v => v.vacation.status === 'PENDING');
  }

  get filteredPendingVacationRequests() {
    const filtered = this.pendingVacationRequests;
    if (!this.dateFilterPending.startDate.getTime() && !this.dateFilterPending.endDate.getTime()) {
      return filtered;
    }
    return filtered.filter(v => {
      const start = new Date(v.vacation.startDate).getTime();
      const from = this.dateFilterPending.startDate.getTime();
      const to = this.dateFilterPending.endDate.getTime() + 86400000;
      return start >= from && start < to;
    });
  }

  onChangeDateFilterPending(newDateFilter: DateFilter) {
    this.dateFilterPending = newDateFilter.startDate && newDateFilter.endDate
      ? newDateFilter
      : { startDate: new Date(0), endDate: new Date(0) };
  }

  onChangeDateFilterCompleted(newDateFilter: DateFilter) {
    this.dateFilterCompleted = newDateFilter.startDate && newDateFilter.endDate
      ? newDateFilter
      : { startDate: new Date(0), endDate: new Date(0) };
  }

  onChangeStatusFilter(newStatusFilter: StatusFilter) {
    this.statusFilter.status = newStatusFilter.status;
  }

  isValidVacation(v: VacationWithUser): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const vacationStart = new Date(v.vacation.startDate);
    vacationStart.setHours(0, 0, 0, 0);

    if (vacationStart < today) return false;

    const cacheKey = `${v.userId}-${v.vacation.id}`;
    return this.validVacationCache.get(cacheKey) ?? true;
  }

  getValidationMessage(v: VacationWithUser): string {
    return this.isValidVacation(v) ? 'Accept' : 'Insufficient vacation days';
  }

  // Now synchronous using cached data
  getUserEmail(userId: number): string {
    if (this.userEmailCache.has(userId)) {
      return this.userEmailCache.get(userId)!;
    }

    const user = this.managerService.getUserById(userId);
    if (user) {
      this.userEmailCache.set(userId, user.email);
      return user.email;
    }

    return 'Loading...';
  }

  disabled(v: VacationWithUser): boolean {
    return this.managerService.getVacationIndex(v) === -1;
  }

  async onAccept(v: VacationWithUser) {
    try {
      await this.managerService.acceptVacation(v);
      await this.refreshVacations();
      await this.preloadUserData();
    } catch (err) {
      console.error('Error accepting vacation:', err);
    }
  }

  async onDeny(v: VacationWithUser) {
    try {
      await this.managerService.rejectVacation(v);
      await this.refreshVacations();
      await this.preloadUserData();
    } catch (err) {
      console.error('Error denying vacation:', err);
    }
  }

  async onUndo(v: VacationWithUser) {
    try {
      await this.managerService.undoVacation(v);
      await this.refreshVacations();
      await this.preloadUserData();
    } catch (err) {
      console.error('Error undoing vacation:', err);
    }
  }

  private async refreshVacations() {
    await this.managerService.initialize();
    this.pendingVacations = this.managerService.pendingVacationsComputed();
    this.completedVacations = this.managerService.completedVacationsComputed();
  }
}
