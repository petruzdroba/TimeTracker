import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { WorkLogService } from './work-log.service';
import { UserDataService } from './user-data.service';
import { Router } from '@angular/router';
import { Session } from '../model/session.interface';

describe('WorkLogService', () => {
  let service: WorkLogService;
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

  beforeEach(() => {
    const userDataSpy = jasmine.createSpyObj('UserDataService', [
      'isLoggedIn',
      'user',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WorkLogService,
        { provide: UserDataService, useValue: userDataSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    service = TestBed.inject(WorkLogService);
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

  it('should initialize and fetch work log data', fakeAsync(() => {
    service.initialize();

    const req = httpMock.expectOne(`${baseUrl}/worklog/get/1/`);
    expect(req.request.method).toBe('GET');

    const today = new Date();
    const mockSessions: Session[] = [
      { date: today, timeWorked: 3600000 }, // 1 hour
    ];

    req.flush(mockSessions);
    tick();

    expect(service.getWorkLog.length).toBe(1);
    expect(service.getWorkLog[0].timeWorked).toBe(3600000);
    expect(service['initialized']()).toBeTrue();
  }));

  it('should handle empty session response in initialize', fakeAsync(() => {
    service.initialize();

    const req = httpMock.expectOne(`${baseUrl}/worklog/get/1/`);
    req.flush([{}]); // empty object array as per your service logic
    tick();

    expect(service.getWorkLog.length).toBe(1);
    expect(service.getWorkLog[0].timeWorked).toBe(0);
  }));

  it('should navigate to error on initialize failure', fakeAsync(() => {
    // Call initialize and catch the rejection to prevent uncaught errors
    service.initialize().catch(() => {});

    const req = httpMock.expectOne(`${baseUrl}/worklog/get/1/`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should add a session and send update request', fakeAsync(() => {
    service.initialize();
    httpMock.expectOne(`${baseUrl}/worklog/get/1/`).flush([]);
    tick();

    const newSession: Session = { date: new Date(), timeWorked: 5000 };
    service.addSession(newSession);

    const putReq = httpMock.expectOne(`${baseUrl}/worklog/update/`);
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body.userId).toBe(1);
    expect(putReq.request.body.data).toContain(newSession);

    putReq.flush({});
    tick();

    expect(service.getWorkLog).toContain(newSession);
  }));

  it('should delete a session and send update request', fakeAsync(() => {
    const session1: Session = { date: new Date(), timeWorked: 5000 };
    const session2: Session = {
      date: new Date(Date.now() - 86400000),
      timeWorked: 10000,
    };

    service.initialize();
    httpMock.expectOne(`${baseUrl}/worklog/get/1/`).flush([session1, session2]);
    tick();

    service.deleteSession(session1);

    const putReq = httpMock.expectOne(`${baseUrl}/worklog/update/`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({});
    tick();

    expect(service.getWorkLog).not.toContain(session1);
    expect(service.getWorkLog.length).toBe(1);
  }));

  it('should edit a session and send update request', fakeAsync(() => {
    const oldSession: Session = { date: new Date(), timeWorked: 60000 };
    service.initialize();
    httpMock.expectOne(`${baseUrl}/worklog/get/1/`).flush([oldSession]);
    tick();

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 120000); // 2 minutes later

    service.editSession(oldSession, startTime, endTime);

    const putReq = httpMock.expectOne(`${baseUrl}/worklog/update/`);
    expect(putReq.request.method).toBe('PUT');
    putReq.flush({});
    tick();

    const updatedSession = service.getWorkLog.find(
      (s) =>
        new Date(s.date).getDate() === startTime.getDate() &&
        s.timeWorked === endTime.getTime() - startTime.getTime()
    );
    expect(updatedSession).toBeDefined();
  }));

  it('should navigate to error on updateWorkLog failure', fakeAsync(() => {
    service.initialize();
    httpMock.expectOne(`${baseUrl}/worklog/get/1/`).flush([]);
    tick();

    service.addSession({ date: new Date(), timeWorked: 1000 });

    const putReq = httpMock.expectOne(`${baseUrl}/worklog/update/`);
    putReq.flush('Error', { status: 500, statusText: 'Server Error' });
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should unsubscribe subscription on destroy', () => {
    const subscriptionSpy = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    (service as any).subscription = subscriptionSpy;

    service.ngOnDestroy();

    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});
