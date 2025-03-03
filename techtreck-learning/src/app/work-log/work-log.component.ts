import { Component, inject, Input, OnInit } from '@angular/core';
import { Session } from './session.interface';
import { WorkLogService } from './work-log.service';

@Component({
  selector: 'app-work-log',
  standalone: true,
  imports: [],
  templateUrl: './work-log.component.html',
  styleUrl: './work-log.component.sass',
})
export class WorkLogComponent implements OnInit {
  private workLogService = inject(WorkLogService);
  protected workLog!: Session[];

  ngOnInit(): void {
    this.workLogService.initWorkLog();
    this.workLog = this.workLogService.getWorkLog;
  }

  onClick() {
    console.log(this.workLog[2]);
  }
}
