import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.sass',
})
export class NotFoundComponent {
  private routerService = inject(Router);
  onReturnClick() {
    this.routerService.navigate(['/home'], { replaceUrl: true });
  }
}
