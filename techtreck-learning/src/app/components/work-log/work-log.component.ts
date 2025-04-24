import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DateFilterComponent } from '../../shared/date-filter/date-filter.component';
import { WorkLogService } from '../../service/work-log.service';
import { DateFilter } from '../../model/date-filter.interface';
import { Session } from '../../model/session.interface';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EditSessionComponent } from './edit-session/edit-session.component';
import { AddSessionComponent } from './add-session/add-session.component';

@Component({
  selector: 'app-work-log',
  standalone: true,
  imports: [
    DatePipe,
    CommonModule,
    DateFilterComponent,
    MatPaginatorModule,
    EditSessionComponent,
    AddSessionComponent,
  ],
  templateUrl: './work-log.component.html',
  styleUrl: './work-log.component.sass',
})
export class WorkLogComponent implements OnInit {
  private workLogService = inject(WorkLogService);
  private dateFilter: DateFilter = {
    startDate: new Date(0),
    endDate: new Date(0),
  };
  protected workLog = signal<Session[]>([]);
  protected sortBy = signal<'date' | 'time'>('date');
  protected sortType = signal<'asc' | 'dsc'>('dsc');

  protected paginatedData: Session[] = [];
  protected pageSize = 10;
  protected pageIndex = 0;

  protected isOpenEdit: boolean = false;
  protected selectedSession: Session | null = null;
  protected isOpenAdd: boolean = false;

  ngOnInit(): void {
    this.workLog.set(this.workLogService.getWorkLog);
    this.pageSize = 10;
    this.updatePaginatedData();
  }

  get sortedWorkLog() {
    if (this.sortBy() === 'date') {
      return this.workLog().sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (this.sortType() === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      });
    } else {
      return this.workLog().sort((a, b) => {
        if (this.sortType() === 'asc') {
          return a.timeWorked - b.timeWorked;
        } else {
          return b.timeWorked - a.timeWorked;
        }
      });
    }
  }

  private updateMethod() {
    this.workLog.set(this.workLogService.getWorkLog);
    this.updatePaginatedData();
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

  openEditWindow(session: Session) {
    this.isOpenEdit = true;
    this.selectedSession = session;
  }

  closeEditWindow() {
    this.isOpenEdit = false;
    this.selectedSession = null;
    this.updateMethod();
  }

  openAddWindow() {
    this.isOpenAdd = true;
  }

  closeAddWindow() {
    this.isOpenAdd = false;
    this.updateMethod();
  }

  endSessionTime(session: Session) {
    const copyDate = new Date(session.date);
    return new Date(copyDate.getTime() + session.timeWorked);
  }

  milisecondsToDate(mili: number) {
    return new Date(mili);
  }

  onSortByChange(clicker: 'date' | 'time') {
    if (this.sortBy() !== clicker) {
      this.sortType.set('asc');
    }
    this.sortBy.set(clicker);
    this.pageIndex = 0;
    this.updatePaginatedData();
  }

  onSortTypeChange() {
    this.sortType.set(this.sortType() === 'asc' ? 'dsc' : 'asc');
    this.pageIndex = 0;
    this.updatePaginatedData();
  }

  onDeleteSession(session: Session) {
    this.workLogService.deleteSession(session);
    this.workLog.set(this.workLogService.getWorkLog);
    this.updatePaginatedData();
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
    this.pageIndex = 0;
    this.updatePaginatedData();
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updatePaginatedData();
  }

  updatePaginatedData() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.filteredWorkLog.slice(startIndex, endIndex);
  }
}
