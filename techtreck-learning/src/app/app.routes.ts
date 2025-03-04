import { Routes } from '@angular/router';
import { TimerComponent } from './timer/timer.component';
import { VacationComponent } from './vacation/vacation.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { WorkLogComponent } from './work-log/work-log.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'timetrack',
    pathMatch: 'full',
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
    path: '**',
    component: NotFoundComponent,
  },
];
