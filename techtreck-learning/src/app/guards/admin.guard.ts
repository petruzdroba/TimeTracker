import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from '../service/user-data.service';

export const adminGuard = () => {
  const userDataService = inject(UserDataService);
  const router = inject(Router);

  if (userDataService.isAdmin()) {
    return true;
  }

  return router.navigate(['/error/401']);
};
