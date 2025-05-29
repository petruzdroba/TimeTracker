import { Component } from '@angular/core';
import { ManagerVacationComponent } from './manager-vacation/manager-vacation.component';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [ManagerVacationComponent],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.sass',
})
export class ManagerComponent {}
