import { Component, inject, OnInit } from '@angular/core';
import { VacationPickerComponent } from './vacation-picker/vacation-picker.component';
import { VacationTableComponent } from './vacation-table/vacation-table.component';
import { Vacation } from '../../model/vacation.interface';
import { VacationService } from '../../service/vacation.service';
import { ProgressBarComponent } from '../../shared/progress-bar/progress-bar.component';
import { MatTabsModule } from '@angular/material/tabs';
import { UserDataService } from '../../service/user-data.service';

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
  protected vacationService = inject(VacationService);
  protected userDataService = inject(UserDataService);

  ngOnInit(): void {
    this.vacationService.loadVacations();
  }

  addVacation(vacationData: Omit<Vacation, 'id'>) {
    this.vacationService.addVacation(vacationData);
  }

  deleteVacation(vacationId: number) {
    this.vacationService.deleteVacation(vacationId);
  }

  editVacation([oldVacation, newVacation]: [Vacation, Vacation]) {
  this.vacationService.updateVacation(newVacation);
}

  get vacationDays(){
    return this.userDataService.user().vacationDays;
  }

  // Expose service data directly
  get vacationData() {
    return this.vacationService.vacationData();
  }
}
