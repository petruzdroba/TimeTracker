import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { LeaveSlipService } from '../../../service/leave-slip.service';
import { LeaveSlip } from '../../../model/leave-slip.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { DateFilter } from '../../../model/date-filter.interface';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';

@Component({
  selector: 'app-admin-leave',
  standalone: true,
  imports: [DatePipe, CommonModule, DateFilterComponent],
  templateUrl: './admin-leave.component.html',
  styleUrl: './admin-leave.component.sass',
})
export class AdminLeaveComponent implements OnInit {
  private leaveService = inject(LeaveSlipService);
  private dateFilterPending: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };

  private dateFilterCompleted: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };
  protected futureLeaves!: LeaveSlip[];
  protected pastLeaves!: LeaveSlip[];

  ngOnInit(): void {
    this.futureLeaves = this.leaveService.futureLeaves;
    this.pastLeaves = this.leaveService.pastLeaves;
  }

  private get pendingLeaveRequests() {
    return [...this.futureLeaves.filter((leave) => leave.status === 'pending')];
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
        const dateA = new Date(leave.date);
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

  private get completedLeaveRequests() {
    return [
      ...this.pastLeaves.filter((leave) => leave.status !== 'pending'),
      ...this.futureLeaves.filter((leave) => leave.status !== 'pending'),
    ];
  }

  get filteredCompletedVacationRequests() {
    if (
      !this.dateFilterCompleted.startDate.getTime() &&
      !this.dateFilterCompleted.endDate.getTime()
    ) {
      return this.completedLeaveRequests;
    }
    return [
      ...this.completedLeaveRequests.filter((leave) => {
        const dateA = new Date(leave.date);
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

  getValidLeave(leave: LeaveSlip) {
    const dateA = new Date(leave.startTime);
    const dateB = new Date(leave.endTime);
    return this.leaveService.remainingTime >= dateB.getTime() - dateA.getTime();
  }

  onDeny(leave: LeaveSlip) {
    leave.status = 'denied';
    this.leaveService.updateLeaveData();
  }

  onAccept(leave: LeaveSlip) {
    leave.status = 'accepted';
    this.leaveService.acceptedLeaveSlip(leave);
    this.leaveService.updateLeaveData();
  }

  disabled(leave: LeaveSlip): boolean {
    const index = this.leaveService.findLeaveIndex(leave);
    return index === -1;
  }

  onUndo(leave: LeaveSlip) {
    const index = this.leaveService.findLeaveIndex(leave);
    if (index !== -1) {
      this.leaveService.restoreLeaveTime(index);
      leave.status = 'pending';
      this.leaveService.updateLeaveData();
    }
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
