import { Routes } from '@angular/router';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { AdminComponent } from './components/admin/admin.component';
import { TimerComponent } from './components/timer/timer.component';
import { VacationComponent } from './components/vacation/vacation.component';
import { WorkLogComponent } from './components/work-log/work-log.component';
import { LeaveSlipComponent } from './components/leave-slip/leave-slip.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: DashboardComponent,
    title: 'Dashboard',
  },
  {
    path: 'timetrack',
    component: TimerComponent,
    title: 'TimeTrack',
  },
  {
    path: 'vacationdays',
    component: VacationComponent,
    title: 'VacationDays',
  },
  {
    path: 'worklog',
    component: WorkLogComponent,
    title: 'Work Log',
  },
  {
    path: 'admin',
    component: AdminComponent,
    title: 'Admin',
  },
  {
    path: 'leaveslip',
    component: LeaveSlipComponent,
    title: 'Leave Slips',
  },
  {
    path: '**',
    component: NotFoundComponent,
  },
];
