import { LeaveSlip } from './leave-slip.interface';
import { LeaveSlipData } from './leaveslip-data.interface';
import { VacationData } from './vacation-data.interface';
import { Vacation } from './vacation.interface';

export interface ManagerData {
  vacations: { [key: number]: VacationData };
  leaves: { [key: number]: LeaveSlipData };
}

export interface VacationWithUser {
  userId: number;
  vacation: Vacation;
}

export interface LeaveWithUser {
  userId: number;
  leave: LeaveSlip;
}
