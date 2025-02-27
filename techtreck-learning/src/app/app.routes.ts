import { Routes } from '@angular/router';
import { TimerComponent } from './timer/timer.component';
import { VacationComponent } from './vacation/vacation.component';
import { NotFoundComponent } from './not-found/not-found.component';

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
    path: '**',
    component: NotFoundComponent,
  },
];
