import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { LeaveSlipService } from './leave-slip.service';
import { UserDataService } from './user-data.service';
import { Router } from '@angular/router';
import { LeaveSlip } from '../model/leave-slip.interface';
import { LeaveSlipData } from '../model/leaveslip-data.interface';

describe('LeaveSlipService', () => {
  let service: LeaveSlipService;
  let userDataService: jasmine.SpyObj<UserDataService>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const baseUrl = 'http://127.0.0.1:8000';

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    workHours: 8,
    vacationDays: 20,
    personalTime: 5,
    role: 'user',
  };

  const mockLeaveData: LeaveSlipData = {
    futureLeaves: [
      {
        date: new Date(Date.now() + 86400000),
        startTime: new Date(Date.now() + 86400000),
        endTime: new Date(Date.now() + 90000000),
        status: 'pending',
        description: 'Future Leave 1',
      },
    ],
    pastLeaves: [],
    remainingTime: 21600000,
  };

  beforeEach(() => {
    const userDataSpy = jasmine.createSpyObj('UserDataService', [
      'isLoggedIn',
      'user',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LeaveSlipService,
        { provide: UserDataService, useValue: userDataSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    service = TestBed.inject(LeaveSlipService);
    userDataService = TestBed.inject(
      UserDataService
    ) as jasmine.SpyObj<UserDataService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    httpMock = TestBed.inject(HttpTestingController);

    userDataService.isLoggedIn.and.returnValue(true);
    userDataService.user.and.returnValue(mockUser);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize and fetch leave data', fakeAsync(() => {
    service.initialize();

    // Expect GET request from initialize()
    const getReq = httpMock.expectOne(`${baseUrl}/leaveslip/get/1/`);
    expect(getReq.request.method).toBe('GET');
    getReq.flush(mockLeaveData);

    tick();

    // Expect PUT request from updateLeaveData() called inside initialize()
    const putReq = httpMock.expectOne(`${baseUrl}/leaveslip/update/`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({});

    tick();

    expect(service.futureLeaves.length).toBe(mockLeaveData.futureLeaves.length);
    expect(service.remainingTime).toBe(mockLeaveData.remainingTime);
  }));

  it('should handle fetch error gracefully', fakeAsync(() => {
    spyOn(console, 'error');

    service.initialize();

    const req = httpMock.expectOne(`${baseUrl}/leaveslip/get/1/`);
    req.flush('Error fetching', { status: 500, statusText: 'Server Error' });

    tick();

    expect(console.error).toHaveBeenCalled();
    expect(service.futureLeaves.length).toBe(0);
  }));

  it('should add a leave and update', fakeAsync(() => {
    const leave: LeaveSlip = {
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      status: 'pending',
      description: 'New Leave',
    };

    // Spy updateLeaveData to expect PUT request
    service.addLeave(leave);

    const putReq = httpMock.expectOne(`${baseUrl}/leaveslip/update/`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({});

    tick();

    expect(service.futureLeaves).toContain(leave);
  }));

  it('should delete a future leave and restore remaining time if accepted', fakeAsync(() => {
    // Add accepted leave first
    const acceptedLeave: LeaveSlip = {
      date: new Date(Date.now() + 86400000),
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 90000000),
      status: 'accepted',
      description: 'Accepted Leave',
    };

    service.addLeave(acceptedLeave);
    httpMock.expectOne(`${baseUrl}/leaveslip/update/`).flush({});
    tick();

    const beforeRemainingTime = service.remainingTime;

    service.deleteLeave(0, 'future');

    // Expect PUT request triggered by restoreLeaveTime and deleteLeave updateLeaveData calls
    const putReqs = httpMock.match(`${baseUrl}/leaveslip/update/`);
    expect(putReqs.length).toBeGreaterThanOrEqual(1);
    putReqs.forEach((req) => req.flush({}));
    tick();

    expect(service.futureLeaves.length).toBe(0);
    expect(service.remainingTime).toBe(beforeRemainingTime);
  }));

  it('should edit a leave and set status to pending', fakeAsync(() => {
    const oldLeave: LeaveSlip = {
      date: new Date(Date.now() + 86400000),
      startTime: new Date(Date.now() + 86400000),
      endTime: new Date(Date.now() + 90000000),
      status: 'accepted',
      description: 'Old Leave',
    };
    const newLeave: LeaveSlip = {
      date: new Date(Date.now() + 172800000),
      startTime: new Date(Date.now() + 172800000),
      endTime: new Date(Date.now() + 180000000),
      status: 'pending', // will be overwritten anyway
      description: 'New Leave',
    };

    service.addLeave(oldLeave);

    const reqs = httpMock.match(`${baseUrl}/leaveslip/update/`);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs.forEach((req) => {
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
    tick();

    service.editLeaveSlip(oldLeave, newLeave);

    // Flush all PUT requests triggered by addLeave and restoreLeaveTime inside it
    let putReqs = httpMock.match(`${baseUrl}/leaveslip/update/`);
    putReqs.forEach((req) => {
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
    tick();

    expect(service.futureLeaves.length).toBe(1);
    expect(service.futureLeaves[0].description).toBe('New Leave');
    expect(service.futureLeaves[0].status).toBe('pending');
  }));

  it('should navigate to error page on updateLeaveData error', fakeAsync(() => {
    const leave: LeaveSlip = {
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      status: 'pending',
      description: 'Leave',
    };

    service.addLeave(leave);

    // Expect PUT call and flush with error
    const putReq = httpMock.expectOne(`${baseUrl}/leaveslip/update/`);
    putReq.flush('Error', { status: 500, statusText: 'Server Error' });

    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should unsubscribe on destroy', () => {
    const subscriptionSpy = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    (service as any).subscription = subscriptionSpy;

    service.ngOnDestroy();

    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});
