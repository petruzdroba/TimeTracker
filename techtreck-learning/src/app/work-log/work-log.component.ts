import { Component, inject, Input, OnInit } from '@angular/core';
import { Session } from './session.interface';
import { WorkLogService } from './work-log.service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-work-log',
  standalone: true,
  imports: [DatePipe, CommonModule],
  templateUrl: './work-log.component.html',
  styleUrl: './work-log.component.sass',
})
export class WorkLogComponent implements OnInit {
  private workLogService = inject(WorkLogService);
  protected workLog!: Session[];
  protected sortBy: 'date' | 'time' = 'date';
  protected sortType: 'asc' | 'dsc' = 'asc';

  ngOnInit(): void {
    this.workLogService.initWorkLog();
    this.workLog = this.workLogService.getWorkLog;
  }

  get sortedWorkLog() {
    if (this.sortBy === 'date') {
      return this.workLog.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (this.sortType === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      });
    } else {
      return this.workLog.sort((a, b) => {
        if (this.sortType === 'asc') {
          return a.timeWorked - b.timeWorked;
        } else {
          return b.timeWorked - a.timeWorked;
        }
      });
    }
  }

  milisecondsToDate(mili: number) {
    return new Date(mili);
  }

  onSortByChange(clicker: 'date' | 'time') {
    if (this.sortBy !== clicker) {
      this.sortType = 'asc';
    }
    this.sortBy = clicker;
  }

  onSortTypeChange() {
    this.sortType = this.sortType === 'asc' ? 'dsc' : 'asc';
  }

  onDeleteSession(session: Session) {
    this.workLogService.deleteSession(session);
    this.workLog = this.workLogService.getWorkLog;
  }
}
