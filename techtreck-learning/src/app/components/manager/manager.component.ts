import { Component, inject } from '@angular/core';
import { ManagerService } from '../../service/manager.service';

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.sass',
})
export class ManagerComponent {
  private managerService = inject(ManagerService);
}
