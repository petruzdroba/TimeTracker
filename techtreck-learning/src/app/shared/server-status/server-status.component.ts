import { Component, inject, signal } from '@angular/core';
import { ServerStatusService } from '../../service/server-status.service';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-server-status',
  templateUrl: './server-status.component.html',
  styleUrls: ['./server-status.component.css'],
})
export class ServerStatusComponent {
  private serverService = inject(ServerStatusService);

  protected serverStatus = this.serverService.getServerStatus;
}
