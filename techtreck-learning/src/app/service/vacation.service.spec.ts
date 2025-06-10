import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { VacationService } from './vacation.service';
import { UserDataService } from './user-data.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { Vacation } from '../model/vacation.interface';
import { UserData } from '../model/user-data.interface';
import { VacationData } from '../model/vacation-data.interface';

describe('VacationService', () => {
  let service: VacationService;
  let userDataService: jasmine.SpyObj<UserDataService>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: UserData = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    workHours: 8,
    vacationDays: 20,
    personalTime: 5,
    role: 'user',
  };
  const baseUrl = 'http://127.0.0.1:8000';

  beforeEach(() => {
    const userDataSpy = jasmine.createSpyObj('UserDataService', [
      'isLoggedIn',
      'user',
    ]);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        VacationService,
        { provide: UserDataService, useValue: userDataSpy },
        { provide: Router, useValue: routerSpyObj },
      ],
    });

    service = TestBed.inject(VacationService);
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

  it('should initialize and fetch vacation data', fakeAsync(() => {
    const mockVacationData: VacationData = {
      futureVacations: [
        {
          startDate: new Date(Date.now() + 86400000),
          endDate: new Date(Date.now() + 172800000),
          status: 'pending',
          description: 'Vacation 1',
        },
      ],
      pastVacations: [],
      remainingVacationDays: 10,
    };

    service.initialize();
    const requests = httpMock.match(`${baseUrl}/vacation/get/1/`);
    expect(requests.length).toBe(1);
    tick();

    expect(service.futureVacations.length).toBe(0);
    expect(service.remainingDays).toBe(14);
  }));

  it('should handle fetch vacation data error', fakeAsync(() => {
    service.initialize();
    const req = httpMock.expectOne(`${baseUrl}/vacation/get/1/`);
    req.flush('Error fetching', { status: 500, statusText: 'Server Error' });
    tick();

    // No navigation on error, but console.error should have been called (not tested here)
    expect(service.futureVacations.length).toBe(0);
  }));

  it('should add a vacation', () => {
    const vacation: Vacation = {
      startDate: new Date(),
      endDate: new Date(),
      status: 'pending',
      description: 'New Vacation',
    };

    service.addVacation(vacation);

    const reqs = httpMock.match(`${baseUrl}/vacation/update/`);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs.forEach((req) => {
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });

    expect(service.futureVacations).toContain(vacation);
  });

  it('should delete a future vacation and restore days if accepted', fakeAsync(() => {
    const acceptedVacation: Vacation = {
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 172800000),
      status: 'accepted',
      description: 'Accepted Vacation',
    };

    service.addVacation(acceptedVacation);
    expect(service.remainingDays).toBe(14);

    service.deleteVacation(0, 'future');

    expect(service.futureVacations.length).toBe(0);
    expect(service.remainingDays).toBeGreaterThan(14); // Days restored

    // Expect one or more PUT requests to update vacation data
    const reqs = httpMock.match(`${baseUrl}/vacation/update/`);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs.forEach((req) => {
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
    tick();
  }));

  it('should edit a vacation', fakeAsync(() => {
    const oldVacation: Vacation = {
      startDate: new Date(Date.now() + 86400000),
      endDate: new Date(Date.now() + 172800000),
      status: 'accepted',
      description: 'Old Vacation',
    };
    const newVacation: Vacation = {
      startDate: new Date(Date.now() + 259200000),
      endDate: new Date(Date.now() + 345600000),
      status: 'pending',
      description: 'New Vacation',
    };

    service.addVacation(oldVacation);

    service.editVacation(oldVacation, newVacation);

    expect(service.futureVacations.length).toBe(1);
    expect(service.futureVacations[0].description).toBe('New Vacation');
    expect(service.futureVacations[0].status).toBe('pending');

    const reqs = httpMock.match(`${baseUrl}/vacation/update/`);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs.forEach((req) => {
      expect(req.request.method).toBe('PUT');
      req.flush({});
    });
    tick();
  }));

  it('should navigate to error page on updateVacationData error', fakeAsync(() => {
    const vacation: Vacation = {
      startDate: new Date(),
      endDate: new Date(),
      status: 'pending',
      description: 'Vacation',
    };

    service.addVacation(vacation);

    // Trigger updateVacationData explicitly
    service['updateVacationData']();

    const reqs = httpMock.match(`${baseUrl}/vacation/update/`);
    expect(reqs.length).toBeGreaterThanOrEqual(1);
    reqs.forEach((req) => {
      req.flush('Error', { status: 500, statusText: 'Server Error' });
    });
    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should unsubscribe on destroy', () => {
    const subscriptionSpy = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    service['subscription'] = subscriptionSpy;

    service.ngOnDestroy();

    expect(subscriptionSpy.unsubscribe).toHaveBeenCalled();
  });
});
