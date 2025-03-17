import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { LeaveSlipService } from '../../../service/leave-slip.service';
import { LeaveSlip } from '../../../model/leave-slip.interface';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-leave',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './admin-leave.component.html',
  styleUrl: './admin-leave.component.sass',
})
export class AdminLeaveComponent implements OnInit {
  private leaveService = inject(LeaveSlipService);
  @Output() switchListEvent = new EventEmitter<void>();
  protected futureLeaves!: LeaveSlip[];
  protected pastLeaves!: LeaveSlip[];

  ngOnInit(): void {
    this.futureLeaves = this.leaveService.futureLeaves;
    this.pastLeaves = this.leaveService.pastLeaves;
  }

  get pendingLeaveRequests() {
    return [...this.futureLeaves.filter((leave) => leave.status === 'pending')];
  }

  get completedLeaveRequests() {
    return [...this.futureLeaves.filter((leave) => leave.status !== 'pending')];
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
    this.leaveService.acceptedVacation(leave);
    this.leaveService.updateLeaveData();
  }

  onToggleList() {
    this.switchListEvent.emit();
  }
}
