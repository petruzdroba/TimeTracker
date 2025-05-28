import { Component, inject, OnInit } from '@angular/core';
import { ManagerService } from '../../service/manager.service';
import { VacationWithUser } from '../../model/manager-data.interface';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.sass',
})
export class ManagerComponent implements OnInit {
  private managerService = inject(ManagerService);
  futureVacations: VacationWithUser[] = [];
  pastVacations: VacationWithUser[] = [];

  ngOnInit(): void {
    this.futureVacations = this.managerService.futureVacations();
    this.pastVacations = this.managerService.pastVacations();
    // console.log('Future Vacations:', this.futureVacations);
    // if (this.futureVacations && this.futureVacations.length > 0) {
    //   this.managerService.acceptVacation(this.futureVacations[0]);
    // }
  }
}
