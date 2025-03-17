import { Component, inject, OnInit } from '@angular/core';
import { LeaveSlipPickerComponent } from './leave-slip-picker/leave-slip-picker.component';
import { LeaveSlipService } from '../../service/leave-slip.service';
import { LeaveSlip } from '../../model/leave-slip.interface';
import { LeaveSlipTableComponent } from './leave-slip-table/leave-slip-table.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { DatePipe } from '@angular/common';
import { ResetButtonComponent } from '../../shared/reset-button/reset-button.component';

@Component({
  selector: 'app-leave-slip',
  standalone: true,
  imports: [
    LeaveSlipPickerComponent,
    LeaveSlipTableComponent,
    ProgressBarComponent,
    DatePipe,
    ResetButtonComponent,
  ],
  templateUrl: './leave-slip.component.html',
  styleUrl: './leave-slip.component.sass',
})
export class LeaveSlipComponent implements OnInit {
  protected leaveSlipService = inject(LeaveSlipService);

  protected remainingTime!: number;
  protected pastLeaves!: LeaveSlip[];
  protected futureLeaves!: LeaveSlip[];
  protected tableShowToggle: 'past' | 'future' = 'future';

  ngOnInit(): void {
    this.remainingTime = this.leaveSlipService.remainingTime;
    this.pastLeaves = this.leaveSlipService.pastLeaves;
    this.futureLeaves = this.leaveSlipService.futureLeaves;
  }

  private updateMethod() {
    this.remainingTime = this.leaveSlipService.remainingTime;
    this.pastLeaves = this.leaveSlipService.pastLeaves;
    this.futureLeaves = this.leaveSlipService.futureLeaves;
  }

  get leaveTime() {
    return new Date(this.remainingTime);
  }

  onToggle() {
    this.tableShowToggle =
      this.tableShowToggle === 'future' ? 'past' : 'future';
  }

  addLeave(leaveData: LeaveSlip) {
    this.leaveSlipService.addLeave(leaveData);
    this.updateMethod();
  }

  deleteLeave(index: number, tableType: 'future' | 'past') {
    this.leaveSlipService.deleteLeave(index, tableType);
    this.updateMethod();
  }
}
