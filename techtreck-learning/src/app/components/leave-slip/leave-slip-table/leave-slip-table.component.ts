import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LeaveSlip } from '../../../model/leave-slip.interface';
import { CommonModule, DatePipe } from '@angular/common';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { LeaveFormComponent } from '../leave-form/leave-form.component';

@Component({
  selector: 'app-leave-slip-table',
  standalone: true,
  imports: [DatePipe, CommonModule, EditBoxComponent, LeaveFormComponent],
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

  get list() {
    return this.leaveList.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (this.sortType === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
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
