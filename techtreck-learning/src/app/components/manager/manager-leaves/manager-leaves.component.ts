import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ManagerService } from '../../../service/manager.service';
import { LeaveWithUser } from '../../../model/manager-data.interface';
import { DateFilter } from '../../../model/date-filter.interface';
import { StatusFilter } from '../../../model/status-filter.interface';
import { CommonModule } from '@angular/common';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';
import { StatusFilterComponent } from '../../../shared/status-filter/status-filter.component';

@Component({
  selector: 'app-manager-leaves',
  standalone: true,
  imports: [CommonModule, DateFilterComponent, StatusFilterComponent],
  templateUrl: './manager-leaves.component.html',
  styleUrl: './manager-leaves.component.sass',
})
export class ManagerLeavesComponent implements OnInit {
  private managerService = inject(ManagerService);

  private dateFilterPending: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };

  private dateFilterCompleted: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };
  private statusFilter: StatusFilter = { status: 'all' };

  futureLeaves: LeaveWithUser[] = [];
  pastLeaves: LeaveWithUser[] = [];

  async ngOnInit(): Promise<void> {
    await this.managerService.initialize();
    this.futureLeaves = this.managerService.futureLeaves();
    this.pastLeaves = this.managerService.pastLeaves();

    console.log('Future Leaves:', this.futureLeaves);
    console.log('Past Leaves:', this.pastLeaves);
  }

  private get pendingLeaveRequests() {
    return [
      ...this.futureLeaves.filter((leave) => leave.leave.status === 'pending'),
    ];
  }

  get filteredPendingVacationRequests() {
    if (
      !this.dateFilterPending.startDate.getTime() &&
      !this.dateFilterPending.endDate.getTime()
    ) {
      return this.pendingLeaveRequests;
    }
    return [
      ...this.pendingLeaveRequests.filter((leave) => {
        const dateA = new Date(leave.leave.date);
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

  private get completedLeaveRequests() {
    return [
      ...this.pastLeaves.filter((leave) => leave.leave.status !== 'pending'),
      ...this.futureLeaves.filter((leave) => leave.leave.status !== 'pending'),
    ];
  }

  private get statusFiltered() {
    if (this.statusFilter.status === 'all') return this.completedLeaveRequests;
    else {
      return this.completedLeaveRequests.filter((leave) => {
        return this.statusFilter.status === leave.leave.status;
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
      ...this.completedLeaveRequests.filter((leave) => {
        const dateA = new Date(leave.leave.date);
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

  getValidLeave(leave: LeaveWithUser) {
    const dateA = new Date(leave.leave.startTime);
    const dateB = new Date(leave.leave.endTime);
    return (
      this.managerService.getRemainingTime(leave.userId) >=
      dateB.getTime() - dateA.getTime()
    );
  }

  getUserEmail(userId: number): string {
    const user = this.managerService.getUserById(userId);
    return user?.email || '';
  }

  async onAccept(leave: LeaveWithUser) {
    await this.managerService.acceptLeave(leave);
    await this.managerService.initialize();
    this.futureLeaves = this.managerService.futureLeaves();
    this.pastLeaves = this.managerService.pastLeaves();
  }

  async onDeny(leave: LeaveWithUser) {
    await this.managerService.rejectLeave(leave);
    await this.managerService.initialize();
    this.futureLeaves = this.managerService.futureLeaves();
    this.pastLeaves = this.managerService.pastLeaves();
  }

  async onUndo(leave: LeaveWithUser) {
    await this.managerService.undoLeave(leave);
    await this.managerService.initialize();
    this.futureLeaves = this.managerService.futureLeaves();
    this.pastLeaves = this.managerService.pastLeaves();
  }

  disabled(leave: LeaveWithUser): boolean {
    const index = this.managerService.getLeaveIndex(leave);
    return index === -1;
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
    this.statusFilter = newStatusFilter;
  }
}
