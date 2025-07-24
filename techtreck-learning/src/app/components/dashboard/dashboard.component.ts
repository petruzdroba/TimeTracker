import { Component, inject } from '@angular/core';
import { GraphComponent } from './graph/graph.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TimerInfoComponent } from './timer-info/timer-info.component';
import { Router } from '@angular/router';
import { DaysInfoComponent } from './days-info/days-info.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    GraphComponent,
    MatProgressSpinnerModule,
    TimerInfoComponent,
    DaysInfoComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private routerService = inject(Router);

  onRefresh() {
    window.location.reload();
  }

  onClick(routePath: string) {
    if (routePath !== 'timetrack') {
      this.routerService.navigate([`/${routePath}`]);
    } else {
      window.location.replace(`/${routePath}`);
    }
  }
}
