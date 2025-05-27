import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { VacationPickerComponent } from './vacation-picker/vacation-picker.component';
import { VacationTableComponent } from './vacation-table/vacation-table.component';
import { Vacation } from '../../model/vacation.interface';
import { VacationService } from '../../service/vacation.service';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { VacationData } from '../../model/vacation-data.interface';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-vacation',
  standalone: true,
  imports: [
    VacationPickerComponent,
    VacationTableComponent,
    ProgressBarComponent,
    MatTabsModule,
  ],
  templateUrl: './vacation.component.html',
  styleUrl: './vacation.component.css',
})
export class VacationComponent implements OnInit {
  protected vacationData = signal<VacationData>({} as VacationData);

  private vacationService = inject(VacationService);

  ngOnInit(): void {
    this.vacationData.set(this.vacationService.vacation);
  }

  addVacation(vacationData: Vacation) {
    this.vacationService.addVacation(vacationData);
    this.vacationService.updateVacationData();
    this.vacationData.set(this.vacationService.vacation);
  }

  deleteVacation(index: number, tableType: string) {
    this.vacationService.deleteVacation(index, tableType);
    this.vacationService.updateVacationData();
    this.vacationData.set(this.vacationService.vacation);
  }

  editVacation([oldLeave, newLeave]: [Vacation, Vacation]) {
    this.vacationService.editVacation(oldLeave, newLeave);
    this.vacationService.updateVacationData();
    this.vacationData.set(this.vacationService.vacation);
  }
}
