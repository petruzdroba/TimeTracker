import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserDataService } from '../service/user-data.service';

export const authGuard = () => {
  const userDataService = inject(UserDataService);
  const router = inject(Router);

  if (userDataService.isLoggedIn()) {
    return true;
  }

  return router.navigate(['/auth']);
};
