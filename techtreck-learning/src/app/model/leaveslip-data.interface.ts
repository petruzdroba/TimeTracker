import { LeaveSlip } from './leave-slip.interface';

export interface LeaveSlipData {
  futureLeaves: LeaveSlip[];
  pastLeaves: LeaveSlip[];
  remainingTime: number; // Remaining time in milliseconds
}
