// import { TestBed } from '@angular/core/testing';
// import { ManagerService } from './manager.service';
// import {
//   HttpClientTestingModule,
//   HttpTestingController,
// } from '@angular/common/http/testing';
// import { Router } from '@angular/router';
// import { Vacation } from '../model/vacation.interface';
// import { LeaveSlip } from '../model/leave-slip.interface';
// import { LeaveSlipData } from '../model/leaveslip-data.interface';
// import {
//   ManagerData,
//   VacationWithUser,
//   LeaveWithUser,
// } from '../model/manager-data.interface';
// import { VacationData } from '../model/vacation-data.interface';
// import { environment } from '../../environments/environment';

// describe('ManagerService', () => {
//   let service: ManagerService;
//   let httpMock: HttpTestingController;
//   let routerSpy: jasmine.SpyObj<Router>;

//   const baseUrl = `${environment.apiUrl}`;

//   beforeEach(() => {
//     routerSpy = jasmine.createSpyObj('Router', ['navigate']);

//     TestBed.configureTestingModule({
//       imports: [HttpClientTestingModule],
//       providers: [{ provide: Router, useValue: routerSpy }],
//     });

//     service = TestBed.inject(ManagerService);
//     httpMock = TestBed.inject(HttpTestingController);
//   });

//   afterEach(() => {
//     httpMock.verify();
//   });

//   const sampleVacation: Vacation = {
//     startDate: new Date('2025-06-20'),
//     endDate: new Date('2025-06-25'),
//     description: 'Trip',
//     status: 'pending',
//   };

//   const vacationData: VacationData = {
//     futureVacations: [sampleVacation],
//     pastVacations: [],
//     remainingVacationDays: 10,
//   };

//   const sampleLeave: LeaveSlip = {
//     date: new Date('2025-06-20'),
//     startTime: new Date('2025-06-20T08:00:00'),
//     endTime: new Date('2025-06-20T12:00:00'),
//     description: 'Doctor',
//     status: 'pending',
//   };

//   const leaveData: LeaveSlipData = {
//     futureLeaves: [sampleLeave],
//     pastLeaves: [],
//     remainingTime: 14400000, // 4 hours in ms
//   };

//   describe('Vacation actions', () => {
//     beforeEach(() => {
//       const managerData: ManagerData = {
//         vacations: { 1: { ...vacationData } },
//         leaves: {},
//       };
//       service['managerData'].set(managerData);

//       // Flush the initial GET triggered by the set (if any)
//       const initialGet = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       initialGet.flush({ vacations: {}, leaves: {} });
//     });

//     it('acceptVacation should PUT with accepted status and update remaining days', async () => {
//       const vacationWithUser: VacationWithUser = {
//         userId: 1,
//         vacation: sampleVacation,
//       };

//       const promise = service.acceptVacation(vacationWithUser);

//       const putReq = httpMock.expectOne(`${baseUrl}/vacation/update/`);
//       expect(putReq.request.method).toBe('PUT');
//       expect(putReq.request.body.data.futureVacations[0].status).toBe(
//         'accepted'
//       );
//       expect(putReq.request.body.data.remainingVacationDays).toBe(6);

//       putReq.flush({});

//       // The second GET triggered inside acceptVacation
//       const getReq = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       expect(getReq.request.method).toBe('GET');
//       getReq.flush({ vacations: {}, leaves: {} });

//       await promise;
//     });

//     it('rejectVacation should PUT with denied status and leave remaining days', async () => {
//       const vacationWithUser: VacationWithUser = {
//         userId: 1,
//         vacation: sampleVacation,
//       };

//       const promise = service.rejectVacation(vacationWithUser);

//       const putReq = httpMock.expectOne(`${baseUrl}/vacation/update/`);
//       expect(putReq.request.method).toBe('PUT');
//       expect(putReq.request.body.data.futureVacations[0].status).toBe('denied');
//       expect(putReq.request.body.data.remainingVacationDays).toBe(10);

//       putReq.flush({});

//       const getReq = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       expect(getReq.request.method).toBe('GET');
//       getReq.flush({ vacations: {}, leaves: {} });

//       await promise;
//     });

//     it('undoVacation should PUT with pending status and add back days', async () => {
//       const acceptedVacation: Vacation = {
//         ...sampleVacation,
//         status: 'accepted',
//       };

//       service['managerData'].set({
//         vacations: {
//           1: { ...vacationData, futureVacations: [acceptedVacation] },
//         },
//         leaves: {},
//       });

//       const vacationWithUser: VacationWithUser = {
//         userId: 1,
//         vacation: acceptedVacation,
//       };

//       const promise = service.undoVacation(vacationWithUser);

//       const putReq = httpMock.expectOne(`${baseUrl}/vacation/update/`);
//       expect(putReq.request.method).toBe('PUT');
//       expect(putReq.request.body.data.futureVacations[0].status).toBe(
//         'pending'
//       );
//       expect(putReq.request.body.data.remainingVacationDays).toBe(14);

//       putReq.flush({});

//       const getReq = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       getReq.flush({ vacations: {}, leaves: {} });

//       await promise;
//     });
//   });

//   describe('Leave actions', () => {
//     beforeEach(() => {
//       const managerData: ManagerData = {
//         vacations: {},
//         leaves: { 1: { ...leaveData } },
//       };
//       service['managerData'].set(managerData);

//       // Flush initial GET triggered by set
//       const initialGet = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       initialGet.flush({ vacations: {}, leaves: {} });
//     });

//     it('acceptLeave should PUT with accepted status and reduce remaining time', async () => {
//       const leaveWithUser: LeaveWithUser = {
//         userId: 1,
//         leave: sampleLeave,
//       };

//       const promise = service.acceptLeave(leaveWithUser);

//       const putReq = httpMock.expectOne(`${baseUrl}/leaveslip/update/`);
//       expect(putReq.request.method).toBe('PUT');
//       expect(putReq.request.body.data.futureLeaves[0].status).toBe('accepted');
//       expect(putReq.request.body.data.remainingTime).toBe(0);

//       putReq.flush({});

//       const getReq = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       expect(getReq.request.method).toBe('GET');
//       getReq.flush({ vacations: {}, leaves: {} });

//       await promise;
//     });

//     it('rejectLeave should PUT with denied status and keep remaining time', async () => {
//       const leaveWithUser: LeaveWithUser = {
//         userId: 1,
//         leave: sampleLeave,
//       };

//       const promise = service.rejectLeave(leaveWithUser);

//       const putReq = httpMock.expectOne(`${baseUrl}/leaveslip/update/`);
//       expect(putReq.request.method).toBe('PUT');
//       expect(putReq.request.body.data.futureLeaves[0].status).toBe('denied');
//       expect(putReq.request.body.data.remainingTime).toBe(14400000);

//       putReq.flush({});

//       const getReq = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       expect(getReq.request.method).toBe('GET');
//       getReq.flush({ vacations: {}, leaves: {} });

//       await promise;
//     });

//     it('undoLeave should PUT with pending status and increase remaining time', async () => {
//       const acceptedLeave: LeaveSlip = {
//         ...sampleLeave,
//         status: 'accepted',
//       };

//       service['managerData'].set({
//         vacations: {},
//         leaves: { 1: { ...leaveData, futureLeaves: [acceptedLeave] } },
//       });

//       const leaveWithUser: LeaveWithUser = {
//         userId: 1,
//         leave: acceptedLeave,
//       };

//       const promise = service.undoLeave(leaveWithUser);

//       const putReq = httpMock.expectOne(`${baseUrl}/leaveslip/update/`);
//       expect(putReq.request.method).toBe('PUT');
//       expect(putReq.request.body.data.futureLeaves[0].status).toBe('pending');
//       expect(putReq.request.body.data.remainingTime).toBe(28800000);

//       putReq.flush({});

//       const getReq = httpMock.expectOne(`${baseUrl}/manager/get/`);
//       getReq.flush({ vacations: {}, leaves: {} });

//       await promise;
//     });
//   });
// });
