import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DateFilterComponent } from '../../shared/date-filter/date-filter.component';
import { WorkLogService } from '../../service/work-log.service';
import { DateFilter } from '../../model/date-filter.interface';
import { Session } from '../../model/session.interface';

@Component({
  selector: 'app-work-log',
  standalone: true,
  imports: [DatePipe, CommonModule, DateFilterComponent],
  templateUrl: './work-log.component.html',
  styleUrl: './work-log.component.sass',
})
export class WorkLogComponent implements OnInit {
  private workLogService = inject(WorkLogService);
  private dateFilter: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };
  protected workLog!: Session[];
  protected sortBy: 'date' | 'time' = 'date';
  protected sortType: 'asc' | 'dsc' = 'asc';
  protected showMore: boolean = false;

  ngOnInit(): void {
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

  get filteredWorkLog() {
    if (
      !this.dateFilter.startDate.getTime() &&
      !this.dateFilter.endDate.getTime()
    ) {
      return this.sortedWorkLog;
    }
    return [
      ...this.sortedWorkLog.filter((session) => {
        const dateA = new Date(session.date);
        const dateB = new Date(this.dateFilter.startDate);
        const dateC = new Date(this.dateFilter.endDate);
        if (
          dateA.getTime() >= dateB.getTime() &&
          dateA.getTime() <= dateC.getTime() + 86400000
        ) {
          return true;
        }
        return false;
      }),
    ];
  }

  endSessionTime(session: Session) {
    const copyDate = new Date(session.date);
    return new Date(copyDate.getTime() + session.timeWorked);
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

  onChangeDateFilter(newDateFilter: DateFilter) {
    if (newDateFilter.startDate === null && newDateFilter.endDate === null) {
      this.dateFilter = {
        startDate: new Date(0),
        endDate: new Date(0),
      };
    } else {
      this.dateFilter = newDateFilter;
    }
  }
}
