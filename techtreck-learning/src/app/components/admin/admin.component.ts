import { Component } from '@angular/core';
import { AdminVacationComponent } from './admin-vacation/admin-vacation.component';
import { AdminLeaveComponent } from './admin-leave/admin-leave.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [AdminVacationComponent, AdminLeaveComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.sass',
})
export class AdminComponent {
  protected toggleType: 'vacation' | 'leave' = 'vacation';

  onToggle() {
    this.toggleType = this.toggleType === 'vacation' ? 'leave' : 'vacation';
  }
}
