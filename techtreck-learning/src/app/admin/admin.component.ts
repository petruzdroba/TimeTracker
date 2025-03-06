import { Component, inject, OnInit } from '@angular/core';
import {
  getDaysBetweenDates,
  VacationService,
} from '../vacation/vacation.service';
import { Vacation } from '../vacation/vacation.interface';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.sass',
})
export class AdminComponent implements OnInit {
  private vacationService = inject(VacationService);
  protected remainingVacationDays!: number;
  protected pastVacations!: Vacation[];
  protected futureVacations!: Vacation[];

  ngOnInit(): void {
    this.futureVacations = this.vacationService.getFutureVacations;
    this.pastVacations = this.vacationService.getPastVacations;
    this.remainingVacationDays = this.vacationService.getRemainingDays;
  }

  get pendingVacationRequests() {
    return [
      ...this.futureVacations.filter(
        (vacation) => vacation.status === 'pending'
      ),
    ];
  }

  get completedVacationRequests() {
    return [
      ...this.futureVacations.filter(
        (vacation) => vacation.status !== 'pending'
      ),
    ];
  }

  getValidVacation(vacation: Vacation): boolean {
    return (
      this.vacationService.getRemainingDays >=
      getDaysBetweenDates(vacation.startDate, vacation.endDate)
    );
  }

  onAccept(vacation: Vacation) {
    if (
      this.vacationService.getRemainingDays >=
      getDaysBetweenDates(vacation.startDate, vacation.endDate)
    ) {
      vacation.status = 'accepted';
      this.vacationService.acceptedVacation(vacation);
      this.vacationService.updateVacationData();
    }
  }

  onDeny(vacation: Vacation) {
    vacation.status = 'denied';
    this.vacationService.updateVacationData();
  }
}
