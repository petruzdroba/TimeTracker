// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { ManagerLeavesComponent } from './manager-leaves.component';
// import { ManagerService } from '../../../service/manager.service';
// import { LeaveWithUser } from '../../../model/manager-data.interface';
// import { DateFilter } from '../../../model/date-filter.interface';
// import { StatusFilter } from '../../../model/status-filter.interface';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// describe('ManagerLeavesComponent', () => {
//   let component: ManagerLeavesComponent;
//   let fixture: ComponentFixture<ManagerLeavesComponent>;
//   let managerServiceSpy: jasmine.SpyObj<ManagerService>;

//   const mockFutureLeaves: LeaveWithUser[] = [
//     {
//       userId: 1,
//       leave: {
//         date: new Date(),
//         status: 'pending',
//         startTime: new Date(),
//         endTime: new Date(Date.now() + 3600000),
//         description: 'Leave description 1',
//       },
//     },
//     {
//       userId: 2,
//       leave: {
//         date: new Date(),
//         status: 'accepted',
//         startTime: new Date(),
//         endTime: new Date(Date.now() + 7200000),
//         description: 'Leave description 2',
//       },
//     },
//   ];

//   const mockPastLeaves: LeaveWithUser[] = [
//     {
//       userId: 3,
//       leave: {
//         date: new Date(),
//         status: 'denied',
//         startTime: new Date(),
//         endTime: new Date(Date.now() - 3600000),
//         description: 'Leave description 3',
//       },
//     },
//   ];

//   beforeEach(async () => {
//     managerServiceSpy = jasmine.createSpyObj('ManagerService', [
//       'initialize',
//       'futureLeaves',
//       'pastLeaves',
//       'getRemainingTime',
//       'getUserById',
//       'acceptLeave',
//       'rejectLeave',
//       'undoLeave',
//       'getLeaveIndex',
//     ]);

//     managerServiceSpy.initialize.and.resolveTo();

//     managerServiceSpy.futureLeaves.and.returnValue(mockFutureLeaves);
//     managerServiceSpy.pastLeaves.and.returnValue(mockPastLeaves);

//     managerServiceSpy.getRemainingTime.and.returnValue(10000000);

//     managerServiceSpy.getUserById.and.callFake((id: number) => ({
//       id,
//       email: `user${id}@test.com`,
//       name: `User ${id}`,
//       workHours: 40,
//       vacationDays: 15,
//       personalTime: 5,
//       role: 'employee',
//     }));

//     managerServiceSpy.acceptLeave.and.resolveTo();
//     managerServiceSpy.rejectLeave.and.resolveTo();
//     managerServiceSpy.undoLeave.and.resolveTo();

//     managerServiceSpy.getLeaveIndex.and.callFake((leave) => {
//       const allLeaves = [...mockFutureLeaves, ...mockPastLeaves];
//       return allLeaves.findIndex(
//         (l) =>
//           l.userId === leave.userId &&
//           l.leave.date.getTime() === leave.leave.date.getTime()
//       );
//     });

//     await TestBed.configureTestingModule({
//       imports: [ManagerLeavesComponent, NoopAnimationsModule],
//       providers: [{ provide: ManagerService, useValue: managerServiceSpy }],
//     }).compileComponents();

//     fixture = TestBed.createComponent(ManagerLeavesComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should load leaves on init', async () => {
//     await component.ngOnInit();
//     expect(managerServiceSpy.initialize).toHaveBeenCalled();
//     expect(component.futureLeaves).toEqual(mockFutureLeaves);
//     expect(component.pastLeaves).toEqual(mockPastLeaves);
//   });

//   it('should filter pending leaves correctly', () => {
//     (component as any).dateFilterPending = {
//       startDate: new Date(0),
//       endDate: new Date(0),
//     };
//     const filtered = component.filteredPendingVacationRequests;
//     expect(filtered.every((l) => l.leave.status === 'pending')).toBeTrue();
//   });

//   it('should filter completed leaves by status filter', () => {
//     (component as any).statusFilter = { status: 'accepted' };
//     const filtered = component.filteredCompletedVacationRequests;
//     expect(filtered.every((l) => l.leave.status === 'accepted')).toBeTrue();
//   });

//   it('should get valid leave correctly', () => {
//     const leave = mockFutureLeaves[0];
//     expect(component.getValidLeave(leave)).toBeTrue();
//   });

//   it('should return user email', () => {
//     const email = component.getUserEmail(1);
//     expect(email).toBe('user1@test.com');
//   });

//   it('should call acceptLeave and refresh leaves', async () => {
//     const leave = mockFutureLeaves[0];
//     await component.onAccept(leave);
//     expect(managerServiceSpy.acceptLeave).toHaveBeenCalledWith(leave);
//     expect(managerServiceSpy.initialize).toHaveBeenCalledTimes(2);
//   });

//   it('should call rejectLeave and refresh leaves', async () => {
//     const leave = mockFutureLeaves[0];
//     await component.onDeny(leave);
//     expect(managerServiceSpy.rejectLeave).toHaveBeenCalledWith(leave);
//     expect(managerServiceSpy.initialize).toHaveBeenCalledTimes(2);
//   });

//   it('should call undoLeave and refresh leaves', async () => {
//     const leave = mockFutureLeaves[0];
//     await component.onUndo(leave);
//     expect(managerServiceSpy.undoLeave).toHaveBeenCalledWith(leave);
//     expect(managerServiceSpy.initialize).toHaveBeenCalledTimes(2);
//   });

//   it('should disable leave if index is -1', () => {
//     const fakeLeave: LeaveWithUser = {
//       userId: 999,
//       leave: {
//         date: new Date(),
//         status: 'pending',
//         startTime: new Date(),
//         endTime: new Date(),
//         description: 'fake leave',
//       },
//     };
//     expect(component.disabled(fakeLeave)).toBeTrue();
//   });

//   it('should update date filters correctly', () => {
//     // Use valid Dates, not null (interface expects Date)
//     const newDateFilter: DateFilter = {
//       startDate: new Date(0),
//       endDate: new Date(0),
//     };
//     (component as any).dateFilterPending = {
//       startDate: new Date(123),
//       endDate: new Date(123),
//     };
//     component.onChangeDateFilterPending(newDateFilter);
//     expect((component as any).dateFilterPending.startDate.getTime()).toBe(0);
//     expect((component as any).dateFilterPending.endDate.getTime()).toBe(0);
//   });

//   it('should update status filter correctly', () => {
//     const newStatusFilter: StatusFilter = { status: 'accepted' };
//     component.onChangeStatusFilter(newStatusFilter);
//     expect((component as any).statusFilter.status).toBe('accepted');
//   });
// });
