import { LeaveSlipData } from './leaveslip-data.interface';
import { VacationData } from './vacation-data.interface';

export interface ManagerData {
  vacations: VacationData[];
  leaves: LeaveSlipData[];
}
