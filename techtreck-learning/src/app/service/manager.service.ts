import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { ManagerData } from '../model/manager-data.interface';
import { UserDataService } from './user-data.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ManagerService implements OnDestroy {
  private userData = inject(UserDataService);
  private routerService = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = 'http://127.0.0.1:8000';
  private subscription: any;

  private managerData = signal<ManagerData>({
    vacations: [],
    leaves: [],
  });

  constructor() {
    this.fetchManagerData();
  }

  private fetchManagerData() {
    this.subscription = this.http
      .get<ManagerData>(this.baseUrl + '/manager/get/')
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.managerData.set(res);
          console.log('Manager data fetched successfully:', this.managerData());
        },
        error: (err) => {
          this.routerService.navigate(['/error/' + err]);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
