import { Component } from '@angular/core';
import { AdminVacationComponent } from './admin-vacation/admin-vacation.component';
import { AdminLeaveComponent } from './admin-leave/admin-leave.component';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminVacationComponent, AdminLeaveComponent, MatTabsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.sass',
})
export class AdminComponent {}
