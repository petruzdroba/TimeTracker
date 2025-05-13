import { Vacation } from './vacation.interface';

export interface VacationData {
  futureVacations: Vacation[];
  pastVacations: Vacation[];
  remainingVacationDays: number;
}
