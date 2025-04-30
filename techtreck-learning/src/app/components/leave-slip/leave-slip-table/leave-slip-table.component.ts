import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LeaveSlip } from '../../../model/leave-slip.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { LeaveFormComponent } from '../leave-form/leave-form.component';
import { DateFilterComponent } from '../../../shared/date-filter/date-filter.component';
import { DateFilter } from '../../../model/date-filter.interface';
import { StatusFilterComponent } from '../../../shared/status-filter/status-filter.component';
import { StatusFilter } from '../../../model/status-filter.interface';

@Component({
  selector: 'app-leave-slip-table',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    EditBoxComponent,
    LeaveFormComponent,
    DateFilterComponent,
    StatusFilterComponent,
  ],
  templateUrl: './leave-slip-table.component.html',
  styleUrl: './leave-slip-table.component.sass',
})
export class LeaveSlipTableComponent {
  @Input({ required: true }) leaveList!: LeaveSlip[];
  @Output() onDeleteLeaveEvent = new EventEmitter<number>();
  @Output() onEditLeaveEvent = new EventEmitter<[LeaveSlip, LeaveSlip]>();

  protected sortType: 'asc' | 'dsc' = 'asc';
  protected isOpen: boolean = false;
  protected selectedLeaveSlip: LeaveSlip | null = null;
  private statusFilter: StatusFilter = { status: 'all' };
  private dateFilter: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };

  private get statusSortedList() {
    if (this.statusFilter.status === 'all') {
      return this.leaveList;
    }
    return this.leaveList.filter((leave) => {
      return leave.status === this.statusFilter.status;
    });
  }

  private get sortedLeaveList() {
    return this.statusSortedList.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
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
      return this.sortedLeaveList;
    }
    return [
      ...this.sortedLeaveList.filter((leave) => {
        const dateA = new Date(leave.date);
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
      const dateA = new Date(this.list[0].date);
      if (dateA < today) return 'past';
    }
    return 'future';
  }

  disabledEdit(leaveSlip: LeaveSlip): boolean {
    const dateA = new Date(leaveSlip.date);
    const dateB = new Date();
    return dateA <= dateB;
  }

  onSortType() {
    this.sortType = this.sortType === 'asc' ? 'dsc' : 'asc';
  }

  onDelete(index: number) {
    this.onDeleteLeaveEvent.emit(index);
  }

  onEdit([oldLeave, newLeave]: [LeaveSlip, LeaveSlip]) {
    this.onEditLeaveEvent.emit([oldLeave, newLeave]);
    // this.closeEditWindow();
  }

  openEditWindow(leaveSlip: LeaveSlip) {
    this.isOpen = true;
    this.selectedLeaveSlip = leaveSlip;
  }

  closeEditWindow() {
    this.isOpen = false;
    this.selectedLeaveSlip = null;
  }
}
