import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkLogComponent } from './work-log.component';
import { WorkLogService } from '../../service/work-log.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Session } from '../../model/session.interface';

describe('WorkLogComponent', () => {
  let component: any;
  let fixture: ComponentFixture<WorkLogComponent>;
  let workLogServiceSpy: jasmine.SpyObj<WorkLogService>;

  let mockSessions: Session[];
  const originalSessions = [
    { date: new Date('2023-01-01T09:00:00'), timeWorked: 7200000 },
    { date: new Date('2023-01-02T10:00:00'), timeWorked: 10800000 },
    // ... your sessions
  ];

  beforeEach(async () => {
    mockSessions = originalSessions.map((s) => ({ ...s }));
    workLogServiceSpy = jasmine.createSpyObj('WorkLogService', [
      'initialize',
      'deleteSession',
    ]);

    workLogServiceSpy.initialize.and.returnValue(Promise.resolve());

    // Mock the getter property getWorkLog
    Object.defineProperty(workLogServiceSpy, 'getWorkLog', {
      get: () => mockSessions,
    });

    await TestBed.configureTestingModule({
      imports: [WorkLogComponent, MatPaginatorModule],
      providers: [{ provide: WorkLogService, useValue: workLogServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkLogComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize workLog on ngOnInit', async () => {
    await component.ngOnInit();

    expect(workLogServiceSpy.initialize).toHaveBeenCalled();
    expect(component.workLog()).toEqual(mockSessions);
    expect(component.pageSize).toBe(10);
    expect(component.paginatedData.length).toBeLessThanOrEqual(10);
  });

  it('should sort by date ascending', () => {
    component.workLog.set(mockSessions);
    component.sortBy.set('date');
    component.sortType.set('asc');

    const sorted = component.sortedWorkLog;

    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].date.getTime()).toBeGreaterThanOrEqual(
        sorted[i - 1].date.getTime()
      );
    }
  });

  it('should sort by time descending', () => {
    component.workLog.set(mockSessions);
    component.sortBy.set('time');
    component.sortType.set('dsc');

    const sorted = component.sortedWorkLog;

    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i - 1].timeWorked).toBeGreaterThanOrEqual(
        sorted[i].timeWorked
      );
    }
  });

  it('should filter workLog by dateFilter', () => {
    component.workLog.set(mockSessions);
    component['dateFilter'] = {
      startDate: new Date('2023-01-02T00:00:00'),
      endDate: new Date('2023-01-03T23:59:59'),
    };

    const filtered = component.filteredWorkLog;

    expect([1, 2]).toContain(filtered.length);
    expect(
      filtered.some(
        (s: Session) =>
          s.date.getTime() === new Date('2023-01-01T09:00:00').getTime()
      )
    ).toBeFalse();
  });

  it('should open and close edit window', () => {
    component.openEditWindow(mockSessions[0]);
    expect(component.isOpenEdit).toBeTrue();
    expect(component.selectedSession).toBe(mockSessions[0]);

    component.closeEditWindow();
    expect(component.isOpenEdit).toBeFalse();
    expect(component.selectedSession).toBeNull();
  });

  it('should open and close add window', () => {
    component.openAddWindow();
    expect(component.isOpenAdd).toBeTrue();

    component.closeAddWindow();
    expect(component.isOpenAdd).toBeFalse();
  });

  it('should calculate end session time correctly', () => {
    const session = mockSessions[0];
    const endTime = component.endSessionTime(session);

    expect(endTime.getTime()).toBe(session.date.getTime() + session.timeWorked);
  });

  it('should convert milliseconds to date', () => {
    const date = component.milisecondsToDate(3600000);
    expect(date).toEqual(new Date(3600000));
  });

  it('should handle onSortByChange', () => {
    component.workLog.set(mockSessions);
    component.sortBy.set('time');
    component.sortType.set('dsc');

    component.onSortByChange('date');

    expect(component.sortBy()).toBe('date');
    expect(component.sortType()).toBe('asc');
    expect(component.pageIndex).toBe(0);
  });

  it('should toggle sortType on onSortTypeChange', () => {
    component.sortType.set('asc');

    component.onSortTypeChange();
    expect(component.sortType()).toBe('dsc');

    component.onSortTypeChange();
    expect(component.sortType()).toBe('asc');
    expect(component.pageIndex).toBe(0);
  });

  it('should delete session and update', () => {
    component.workLog.set(mockSessions);
    component['updatePaginatedData'] = jasmine.createSpy('updatePaginatedData');

    workLogServiceSpy.deleteSession.and.callFake((session) => {
      const index = mockSessions.findIndex(
        (s) =>
          s.date.getTime() === session.date.getTime() &&
          s.timeWorked === session.timeWorked
      );
      if (index > -1) mockSessions.splice(index, 1);
    });

    const sessionToDelete = mockSessions[1]; // store this before deletion

    component.onDeleteSession(sessionToDelete);

    expect(workLogServiceSpy.deleteSession).toHaveBeenCalledWith(
      sessionToDelete
    );
    expect(component.workLog()).toEqual(mockSessions);
    expect(component['updatePaginatedData']).toHaveBeenCalled();
  });

  it('should change date filter and update', () => {
    component['updatePaginatedData'] = jasmine.createSpy('updatePaginatedData');
    const newFilter = {
      startDate: new Date('2023-01-01'),
      endDate: new Date('2023-01-31'),
    };

    component.onChangeDateFilter(newFilter);

    expect(component['dateFilter']).toEqual(newFilter);
    expect(component.pageIndex).toBe(0);
    expect(component['updatePaginatedData']).toHaveBeenCalled();
  });

  it('should reset date filter to default if nulls', () => {
    component['updatePaginatedData'] = jasmine.createSpy('updatePaginatedData');

    component.onChangeDateFilter({ startDate: null, endDate: null } as any);

    expect(component['dateFilter'].startDate.getTime()).toBe(0);
    expect(component['dateFilter'].endDate.getTime()).toBe(0);
    expect(component.pageIndex).toBe(0);
    expect(component['updatePaginatedData']).toHaveBeenCalled();
  });

  it('should handle page change', () => {
    component['updatePaginatedData'] = jasmine.createSpy('updatePaginatedData');

    component.onPageChange({ pageIndex: 2, pageSize: 5, length: 15 });

    expect(component.pageIndex).toBe(2);
    expect(component.pageSize).toBe(5);
    expect(component['updatePaginatedData']).toHaveBeenCalled();
  });

  it('should update paginatedData correctly', () => {
    component.workLog.set(mockSessions);
    component['dateFilter'] = {
      startDate: new Date(0),
      endDate: new Date(0),
    };
    component.pageIndex = 0;
    component.pageSize = 2;

    component.updatePaginatedData();

    expect(component.paginatedData.length).toBe(2);
    expect(component.paginatedData).toEqual(mockSessions.slice(0, 2));
  });
});
