import { Routes } from '@angular/router';
import { TimerComponent } from './timer/timer.component';
import { VacationComponent } from './vacation/vacation.component';

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
    path: 'match',
    component: VacationComponent,
    title: 'VacationDays',
  },
];
