import { Component, inject, OnInit } from '@angular/core';
import { VacationPickerComponent } from './vacation-picker/vacation-picker.component';
import { VacationTableComponent } from './vacation-table/vacation-table.component';
import { Vacation } from '../../model/vacation.interface';
import { VacationService } from '../../service/vacation.service';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { ResetButtonComponent } from '../../shared/reset-button/reset-button.component';

@Component({
  selector: 'app-vacation',
  standalone: true,
  imports: [
    VacationPickerComponent,
    VacationTableComponent,
    ProgressBarComponent,
    ResetButtonComponent,
  ],
  templateUrl: './vacation.component.html',
  styleUrl: './vacation.component.css',
})
export class VacationComponent implements OnInit {
  protected remainingVacationDays!: number;
  protected pastVacations!: Vacation[];
  protected futureVacations!: Vacation[];
  protected tableShowToggle: 'past' | 'future' = 'future';

  protected vacationService = inject(VacationService);

  ngOnInit(): void {
    this.futureVacations = this.vacationService.futureVacations;
    this.pastVacations = this.vacationService.pastVacations;
    this.remainingVacationDays = this.vacationService.remainingDays;
  }

  private updateMethod() {
    this.futureVacations = this.vacationService.futureVacations;
    this.pastVacations = this.vacationService.pastVacations;
    this.remainingVacationDays = this.vacationService.remainingDays;
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
