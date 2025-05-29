import { Component, inject, OnInit, signal } from '@angular/core';
import { LeaveSlipPickerComponent } from './leave-slip-picker/leave-slip-picker.component';
import { LeaveSlipService } from '../../service/leave-slip.service';
import { LeaveSlip } from '../../model/leave-slip.interface';
import { LeaveSlipTableComponent } from './leave-slip-table/leave-slip-table.component';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { DatePipe } from '@angular/common';
import { LeaveSlipData } from '../../model/leaveslip-data.interface';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-leave-slip',
  standalone: true,
  imports: [
    LeaveSlipPickerComponent,
    LeaveSlipTableComponent,
    ProgressBarComponent,
    DatePipe,
    MatTabsModule,
  ],
  templateUrl: './leave-slip.component.html',
  styleUrl: './leave-slip.component.sass',
})
export class LeaveSlipComponent implements OnInit {
  protected leaveData = signal<LeaveSlipData>({} as LeaveSlipData);
  private leaveSlipService = inject(LeaveSlipService);

  async ngOnInit(): Promise<void> {
    this.leaveSlipService.initialize();
    this.leaveData.set(this.leaveSlipService.leaveSlip);
  }

  get leaveTime() {
    return new Date(this.leaveData().remainingTime);
  }

  addLeave(leaveData: LeaveSlip) {
    this.leaveSlipService.addLeave(leaveData);
    this.leaveData.set(this.leaveSlipService.leaveSlip);
  }

  deleteLeave(index: number, tableType: 'future' | 'past') {
    this.leaveSlipService.deleteLeave(index, tableType);
    this.leaveData.set(this.leaveSlipService.leaveSlip);
  }

  editLeave([oldLeave, newLeave]: [LeaveSlip, LeaveSlip]) {
    this.leaveSlipService.editLeaveSlip(oldLeave, newLeave);
    this.leaveData.set(this.leaveSlipService.leaveSlip);
  }
}
