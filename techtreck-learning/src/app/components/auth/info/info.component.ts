import {
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { UserDataService } from '../../../service/user-data.service';
import { UserData } from '../../../model/user-data.interface';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [],
  templateUrl: './info.component.html',
  styleUrl: './info.component.sass',
})
export class InfoComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  private userService = inject(UserDataService);
  private router = inject(Router);

  protected userData = signal<UserData>({} as UserData);

  ngOnInit(): void {
    this.userData.set(this.userService.user());
  }

  onDelete(password: string): void {
    this.userService
      .delete(password)
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          this.userService.logout();
        },
        error: (err) => {
          if (err.status === 401) {
            this.userService.logout();
          }
          this.router.navigate(['/error', err.status]);
        },
      });
  }

  onLogout(): void {
    this.userService.logout();
    this.close.emit();
  }
}
