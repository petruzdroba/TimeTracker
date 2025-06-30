import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TimerService } from './timer.service';
import { HttpClient } from '@angular/common/http';
import { UserDataService } from './user-data.service';
import { Router } from '@angular/router';
import { TimerData } from '../model/timer-data.interface';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

describe('TimerService', () => {
  let service: TimerService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let userDataServiceMock: jasmine.SpyObj<UserDataService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'put']);
    userDataServiceMock = jasmine.createSpyObj('UserDataService', [
      'user',
      'isLoggedIn',
    ]);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    // Setup default mock responses
    httpClientSpy.get.and.returnValue(
      of({
        id: 1,
        startTime: new Date(),
        endTime: new Date(),
        requiredTime: 28800000,
        timerType: 'OFF',
      })
    );

    // Add PUT mock response
    httpClientSpy.put.and.returnValue(of({}));

    userDataServiceMock.user.and.returnValue({
      id: 1,
      workHours: 8,
      name: 'Test User',
      email: 'test@test.com',
      role: 'user',
      vacationDays: 0,
      personalTime: 0,
    });
    userDataServiceMock.isLoggedIn.and.returnValue(true);

    TestBed.configureTestingModule({
      providers: [
        TimerService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UserDataService, useValue: userDataServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(TimerService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(service.timerType).toBe('OFF');
    expect(service.requiredTime).toBe(28800000); // 8 hours in ms
  });

  it('should fetch timer data when logged in', fakeAsync(() => {
    const mockTimerData: TimerData = {
      id: 1,
      startTime: new Date(),
      endTime: new Date(),
      requiredTime: 28800000,
      timerType: 'OFF',
    };

    httpClientSpy.get.and.returnValue(of(mockTimerData));
    service.fetchTimerData();
    tick();

    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrl}/timer/get/1/`
    );
  }));

  it('should handle errors when fetching timer data', fakeAsync(() => {
    const errorResponse = new Error('Test error');
    httpClientSpy.get.and.returnValue(throwError(() => errorResponse));

    service.fetchTimerData();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/error', errorResponse]);
  }));

  it('should sync timer data', fakeAsync(() => {
    // Freeze time for consistent testing
    jasmine.clock().install();
    const now = new Date();
    jasmine.clock().mockDate(now);

    const mockTimerData: TimerData = {
      id: 1,
      startTime: now,
      endTime: now,
      requiredTime: 28800000,
      timerType: 'OFF',
    };

    service['lastSync'] = new Date(now.getTime() - 100000);
    service.updateTimerData(mockTimerData);
    tick();

    const putCall = httpClientSpy.put.calls.mostRecent();
    expect(putCall.args[0]).toBe(`${environment.apiUrl}/timer/sync/`);

    const callData = putCall.args[1];
    expect(callData.userId).toBe(1);
    expect(callData.data.id).toBe(1);
    expect(callData.data.requiredTime).toBe(28800000);
    expect(callData.data.timerType).toBe('OFF');

    // Compare dates within a small tolerance
    const startDiff = Math.abs(
      new Date(callData.data.startTime).getTime() - now.getTime()
    );
    const endDiff = Math.abs(
      new Date(callData.data.endTime).getTime() - now.getTime()
    );
    expect(startDiff).toBeLessThanOrEqual(100);
    expect(endDiff).toBeLessThanOrEqual(100);

    jasmine.clock().uninstall();
  }));

  it('should calculate same day correctly', () => {
    const today = new Date();
    const sameDay = new Date(today);
    sameDay.setHours(today.getHours() + 1);

    const differentDay = new Date(today);
    differentDay.setDate(today.getDate() + 1);

    expect(service['isSameDay'](today, sameDay)).toBe(true);
    expect(service['isSameDay'](today, differentDay)).toBe(false);
  });

  it('should handle subscription cleanup on destroy', fakeAsync(() => {
    const mockTimerData: TimerData = {
      id: 1,
      startTime: new Date(),
      endTime: new Date(),
      requiredTime: 28800000,
      timerType: 'OFF',
    };

    service['lastSync'] = new Date(Date.now() - 1000000);
    service.updateTimerData(mockTimerData);
    tick();

    service.ngOnDestroy();
    expect(httpClientSpy.put).toHaveBeenCalled();
  }));
});
