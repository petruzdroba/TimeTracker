import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-page.component.html',
  styleUrl: './error-page.component.css',
})
export class ErrorPageComponent implements OnInit, OnDestroy {
  private routerService = inject(Router);
  statusCode: number = 404;
  statusMessage: string = 'Page Not Found';
  private subscription: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.subscription = this.route.params.subscribe((params) => {
      if (params['code']) {
        this.statusCode = parseInt(params['code']);
        this.setStatusMessage();
      }
    });
  }

  private setStatusMessage() {
    switch (this.statusCode) {
      case 400:
        this.statusMessage = 'Bad Request';
        break;
      case 401:
        this.statusMessage = 'Unauthorized';
        break;
      case 403:
        this.statusMessage = 'Forbidden';
        break;
      case 404:
        this.statusMessage = 'Page Not Found';
        break;
      case 500:
        this.statusMessage = 'Internal Server Error';
        break;
      default:
        this.statusMessage = 'An Error Occurred';
    }
  }

  onReturnClick() {
    this.routerService.navigate(['/home'], { replaceUrl: true });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
