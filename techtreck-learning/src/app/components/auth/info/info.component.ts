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

  protected userData = signal<UserData>({} as UserData);

  ngOnInit(): void {
    this.userData.set(this.userService.user());
  }

  onLogout(): void {
    this.userService.logout();
    this.close.emit();
  }
}
