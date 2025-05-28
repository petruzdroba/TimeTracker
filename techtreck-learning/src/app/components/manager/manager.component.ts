import { Component, inject, OnInit } from '@angular/core';
import { ManagerService } from '../../service/manager.service';
import { Vacation } from '../../model/vacation.interface';
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
  }
}
