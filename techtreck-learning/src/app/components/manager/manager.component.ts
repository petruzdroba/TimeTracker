import { Component } from '@angular/core';
import { ManagerVacationComponent } from './manager-vacation/manager-vacation.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ManagerLeavesComponent } from './manager-leaves/manager-leaves.component';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [ManagerVacationComponent, MatTabsModule, ManagerLeavesComponent],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css',
})
export class ManagerComponent {}
