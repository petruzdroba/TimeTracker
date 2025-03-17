import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LeaveSlip } from '../../../model/leave-slip.interface';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-leave-slip-table',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './leave-slip-table.component.html',
  styleUrl: './leave-slip-table.component.sass',
})
export class LeaveSlipTableComponent {
  @Input({ required: true }) leaveList!: LeaveSlip[];
  @Output() onDeleteLeaveEvent = new EventEmitter<number>();
  protected sortType: 'asc' | 'dsc' = 'asc';

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

  onSortType() {
    this.sortType = this.sortType === 'asc' ? 'dsc' : 'asc';
  }

  onDelete(index: number) {
    this.onDeleteLeaveEvent.emit(index);
  }
}
