import { Component, inject, OnInit } from '@angular/core';
import { ResetVacationComponent } from './reset-vacation/reset-vacation.component';
import { VacationPickerComponent } from './vacation-picker/vacation-picker.component';
import { VacationTableComponent } from './vacation-table/vacation-table.component';
import { VacationProgressComponent } from './vacation-progress/vacation-progress.component';
import { Vacation } from './vacation.interface';
import { VacationService } from './vacation.service';

@Component({
  selector: 'app-vacation',
  standalone: true,
  imports: [
    ResetVacationComponent,
    VacationPickerComponent,
    VacationTableComponent,
    VacationProgressComponent,
  ],
  templateUrl: './vacation.component.html',
  styleUrl: './vacation.component.css',
})
export class VacationComponent implements OnInit {
  protected remainingVacationDays!: number;
  protected pastVacations!: Vacation[];
  protected futureVacations!: Vacation[];
  protected tableShowToggle: 'past' | 'future' = 'future';

  private vacationService = inject(VacationService);

  ngOnInit(): void {
    this.futureVacations = this.vacationService.getFutureVacations;
    this.pastVacations = this.vacationService.getPastVacations;
    this.remainingVacationDays = this.vacationService.getRemainingDays;
  }

  private updateMethod() {
    this.futureVacations = this.vacationService.getFutureVacations;
    this.pastVacations = this.vacationService.getPastVacations;
    this.remainingVacationDays = this.vacationService.getRemainingDays;
  }

  updateVacationData() {
    this.vacationService.updateVacationData();
  }

  onToggle() {
    this.tableShowToggle =
      this.tableShowToggle === 'future' ? 'past' : 'future';
  }

  addVacation(vacationData: Vacation) {
    this.vacationService.addVacation(vacationData);
    this.updateMethod();
  }

  deleteVacation(index: number, tableType: string) {
    this.vacationService.deleteVacation(index, tableType);
    this.updateMethod();
  }
}
