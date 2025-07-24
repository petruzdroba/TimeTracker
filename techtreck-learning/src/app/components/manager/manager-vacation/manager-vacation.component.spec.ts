import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManagerVacationComponent } from './manager-vacation.component';
import { ManagerService } from '../../../service/manager.service';
import { VacationWithUser } from '../../../model/manager-data.interface';
import { DateFilter } from '../../../model/date-filter.interface';
import { StatusFilter } from '../../../model/status-filter.interface';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ManagerVacationComponent', () => {
  let component: ManagerVacationComponent;
  let fixture: ComponentFixture<ManagerVacationComponent>;
  let managerServiceSpy: jasmine.SpyObj<ManagerService>;

  const mockFutureVacations: VacationWithUser[] = [
    {
      userId: 1,
      vacation: {
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-08-15'),
        status: 'pending',
        description: 'Vacation to Hawaii',
      },
    },
    {
      userId: 2,
      vacation: {
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-05'),
        status: 'accepted',
        description: 'Conference trip',
      },
    },
  ];

  const mockPastVacations: VacationWithUser[] = [
    {
      userId: 3,
      vacation: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        status: 'denied',
        description: 'Sick leave',
      },
    },
  ];

  beforeEach(async () => {
    managerServiceSpy = jasmine.createSpyObj('ManagerService', [
      'initialize',
      'futureVacations',
      'pastVacations',
      'getRemainingDays',
      'getUserById',
      'getVacationIndex',
      'acceptVacation',
      'rejectVacation',
      'undoVacation',
    ]);

    managerServiceSpy.initialize.and.returnValue(Promise.resolve());
    managerServiceSpy.futureVacations.and.returnValue(mockFutureVacations);
    managerServiceSpy.pastVacations.and.returnValue(mockPastVacations);

    await TestBed.configureTestingModule({
      imports: [ManagerVacationComponent, NoopAnimationsModule],
      providers: [{ provide: ManagerService, useValue: managerServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerVacationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component and initialize vacations', async () => {
    await component.ngOnInit();

    expect(managerServiceSpy.initialize).toHaveBeenCalled();
    expect(component.futureVacations).toEqual(mockFutureVacations);
    expect(component.pastVacations).toEqual(mockPastVacations);
  });

  it('completedVacationRequests returns all non-pending vacations', () => {
    const completed = (component as any).completedVacationRequests;
    expect(
      completed.every((v: VacationWithUser) => v.vacation.status !== 'pending')
    ).toBeTrue();
  });

  it('statusFiltered returns all completed if status is "all"', () => {
    (component as any).statusFilter = { status: 'all' };
    const result = (component as any).statusFiltered;
    expect(result.length).toBeGreaterThan(0);
  });

  it('statusFiltered filters by status when not "all"', () => {
    (component as any).statusFilter = { status: 'denied' };
    const result = (component as any).statusFiltered;
    expect(
      result.every((v: VacationWithUser) => v.vacation.status === 'denied')
    ).toBeTrue();
  });

  it('filteredCompletedVacationRequests returns filtered vacations by date', () => {
    (component as any).dateFilterCompleted = {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
    };
    (component as any).statusFilter = { status: 'all' };

    const filtered = component.filteredCompletedVacationRequests;
    expect(
      filtered.every((v) => {
        const start = new Date(v.vacation.startDate).getTime();
        return (
          start >= (component as any).dateFilterCompleted.startDate.getTime() &&
          start <
            (component as any).dateFilterCompleted.endDate.getTime() + 86400000
        );
      })
    ).toBeTrue();
  });

  it('filteredPendingVacationRequests returns filtered pending vacations by date', () => {
    (component as any).dateFilterPending = {
      startDate: new Date('2025-08-01'),
      endDate: new Date('2025-08-31'),
    };

    const filtered = component.filteredPendingVacationRequests;
    expect(filtered.every((v) => v.vacation.status === 'pending')).toBeTrue();
    expect(
      filtered.every((v) => {
        const start = new Date(v.vacation.startDate).getTime();
        return (
          start >= (component as any).dateFilterPending.startDate.getTime() &&
          start <
            (component as any).dateFilterPending.endDate.getTime() + 86400000
        );
      })
    ).toBeTrue();
  });

  it('onChangeDateFilterPending resets dateFilterPending when dates are epoch', () => {
    component.onChangeDateFilterPending({
      startDate: new Date(0),
      endDate: new Date(0),
    });
    expect((component as any).dateFilterPending.startDate.getTime()).toBe(0);
    expect((component as any).dateFilterPending.endDate.getTime()).toBe(0);
  });

  it('onChangeDateFilterCompleted resets dateFilterCompleted when dates are epoch', () => {
    component.onChangeDateFilterCompleted({
      startDate: new Date(0),
      endDate: new Date(0),
    });
    expect((component as any).dateFilterCompleted.startDate.getTime()).toBe(0);
    expect((component as any).dateFilterCompleted.endDate.getTime()).toBe(0);
  });

  it('onChangeStatusFilter updates the statusFilter', () => {
    component.onChangeStatusFilter({ status: 'denied' });
    expect((component as any).statusFilter.status).toBe('denied');
  });

  it('getValidVacation returns true if user has enough remaining days', () => {
    managerServiceSpy.getRemainingDays.and.returnValue(10);

    const vacation = mockFutureVacations[0];
    const result = component.getValidVacation(vacation);

    expect(result).toBeTrue();
  });

  it('getValidVacation returns false if user has insufficient remaining days', () => {
    managerServiceSpy.getRemainingDays.and.returnValue(0);

    const vacation = mockFutureVacations[0];
    const result = component.getValidVacation(vacation);

    expect(result).toBeFalse();
  });

  it('getValidVacation returns false if getRemainingDays returns falsy', () => {
    managerServiceSpy.getRemainingDays.and.returnValue(undefined as any);

    const vacation = mockFutureVacations[0];
    const result = component.getValidVacation(vacation);

    expect(result).toBeFalse();
  });

  it('getUserEmail returns email from service or empty string if no user', () => {
    managerServiceSpy.getUserById.and.returnValue({
      email: 'user@example.com',
    } as any);
    expect(component.getUserEmail(1)).toBe('user@example.com');

    managerServiceSpy.getUserById.and.returnValue(null);
    expect(component.getUserEmail(999)).toBe('');
  });

  it('disabled returns true if vacation index is -1', () => {
    managerServiceSpy.getVacationIndex.and.returnValue(-1);
    expect(component.disabled(mockFutureVacations[0])).toBeTrue();
  });

  it('disabled returns false if vacation index is >= 0', () => {
    managerServiceSpy.getVacationIndex.and.returnValue(5);
    expect(component.disabled(mockFutureVacations[0])).toBeFalse();
  });

  it('onAccept calls service acceptVacation and refreshes lists', async () => {
    managerServiceSpy.acceptVacation.and.returnValue(Promise.resolve());
    managerServiceSpy.initialize.and.returnValue(Promise.resolve());
    managerServiceSpy.futureVacations.and.returnValue(mockFutureVacations);
    managerServiceSpy.pastVacations.and.returnValue(mockPastVacations);

    await component.onAccept(mockFutureVacations[0]);

    expect(managerServiceSpy.acceptVacation).toHaveBeenCalledWith(
      mockFutureVacations[0]
    );
    expect(managerServiceSpy.initialize).toHaveBeenCalled();
    expect(component.futureVacations).toEqual(mockFutureVacations);
    expect(component.pastVacations).toEqual(mockPastVacations);
  });

  it('onDeny calls service rejectVacation and refreshes lists', async () => {
    managerServiceSpy.rejectVacation.and.returnValue(Promise.resolve());
    managerServiceSpy.initialize.and.returnValue(Promise.resolve());
    managerServiceSpy.futureVacations.and.returnValue(mockFutureVacations);
    managerServiceSpy.pastVacations.and.returnValue(mockPastVacations);

    await component.onDeny(mockFutureVacations[0]);

    expect(managerServiceSpy.rejectVacation).toHaveBeenCalledWith(
      mockFutureVacations[0]
    );
    expect(managerServiceSpy.initialize).toHaveBeenCalled();
    expect(component.futureVacations).toEqual(mockFutureVacations);
    expect(component.pastVacations).toEqual(mockPastVacations);
  });

  it('onUndo calls service undoVacation and refreshes lists', async () => {
    managerServiceSpy.undoVacation.and.returnValue(Promise.resolve());
    managerServiceSpy.initialize.and.returnValue(Promise.resolve());
    managerServiceSpy.futureVacations.and.returnValue(mockFutureVacations);
    managerServiceSpy.pastVacations.and.returnValue(mockPastVacations);

    await component.onUndo(mockPastVacations[0]);

    expect(managerServiceSpy.undoVacation).toHaveBeenCalledWith(
      mockPastVacations[0]
    );
    expect(managerServiceSpy.initialize).toHaveBeenCalled();
    expect(component.futureVacations).toEqual(mockFutureVacations);
    expect(component.pastVacations).toEqual(mockPastVacations);
  });
});
