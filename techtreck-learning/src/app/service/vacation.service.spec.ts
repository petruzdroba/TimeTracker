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
import { environment } from '../../environments/environment';

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
  const baseUrl = `${environment.apiUrl}`;

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

  it('should load future and past vacations and remaining days', fakeAsync(() => {
    const mockFuture: Vacation[] = [
      {
        id: 1,
        startDate: new Date(),
        endDate: new Date(),
        description: 'Future',
        status: 'pending',
      },
    ];
    const mockPast: Vacation[] = [
      {
        id: 2,
        startDate: new Date(),
        endDate: new Date(),
        description: 'Past',
        status: 'accepted',
      },
    ];

    service.loadVacations();

    const futureReq = httpMock.expectOne(`${baseUrl}/vacation/user/1/FUTURE`);
    expect(futureReq.request.method).toBe('GET');
    futureReq.flush(mockFuture);

    const pastReq = httpMock.expectOne(`${baseUrl}/vacation/user/1/PAST`);
    expect(pastReq.request.method).toBe('GET');
    pastReq.flush(mockPast);

    const remainingReq = httpMock.expectOne(
      `${baseUrl}/vacation/user/remaining/1`
    );
    expect(remainingReq.request.method).toBe('GET');
    remainingReq.flush(15);

    tick();

    expect(service.futureVacations$()).toEqual(mockFuture);
    expect(service.pastVacations$()).toEqual(mockPast);
    expect(service.remainingDays()).toBe(15);
  }));

  it('should handle error when loading vacations', fakeAsync(() => {
    service.loadVacations();

    httpMock
      .expectOne(`${baseUrl}/vacation/user/1/FUTURE`)
      .flush('Error', { status: 500, statusText: 'Server Error' });
    httpMock
      .expectOne(`${baseUrl}/vacation/user/1/PAST`)
      .flush([], { status: 200, statusText: 'OK' });
    httpMock.expectOne(`${baseUrl}/vacation/user/remaining/1`).flush(0);

    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should add a vacation', fakeAsync(() => {
    const newVacation: Vacation = {
      id: 3,
      startDate: new Date(),
      endDate: new Date(),
      description: 'New Vacation',
      status: 'pending',
    };

    service.addVacation({
      startDate: newVacation.startDate,
      endDate: newVacation.endDate,
      description: newVacation.description,
      status: 'pending',
    });

    const addReq = httpMock.expectOne(`${baseUrl}/vacation`);
    expect(addReq.request.method).toBe('POST');
    expect(addReq.request.body.userId).toBe(1);
    addReq.flush(newVacation);

    const remainingReq = httpMock.expectOne(
      `${baseUrl}/vacation/user/remaining/1`
    );
    remainingReq.flush(18);

    tick();

    expect(service.futureVacations$().length).toBe(1);
    expect(service.futureVacations$()[0].description).toBe('New Vacation');
    expect(service.remainingDays()).toBe(18);
  }));

  it('should update a vacation', fakeAsync(() => {
    const existing: Vacation = {
      id: 1,
      startDate: new Date(),
      endDate: new Date(),
      description: 'Old',
      status: 'pending',
    };

    // First, add it to signal manually
(service as any).futureVacations.set([existing]);

    service.updateVacation({ ...existing, description: 'Updated' });

    const updateReq = httpMock.expectOne(`${baseUrl}/vacation`);
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush({ ...existing, description: 'Updated' });

    const remainingReq = httpMock.expectOne(
      `${baseUrl}/vacation/user/remaining/1`
    );
    remainingReq.flush(18);

    tick();

    expect(service.futureVacations$()[0].description).toBe('Updated');
  }));

  it('should delete a vacation', fakeAsync(() => {
    const vac: Vacation = {
      id: 1,
      startDate: new Date(),
      endDate: new Date(),
      description: 'Vacation',
      status: 'pending',
    };
    const existing: Vacation = {
      id: 1,
      startDate: new Date(),
      endDate: new Date(),
      description: 'Old',
      status: 'pending',
    };
    (service as any).futureVacations.set([existing]);
    (service as any).futureVacations.set([vac] as any);
    (service as any).pastVacations.set([vac] as any);

    service.deleteVacation(1);

    const deleteReq = httpMock.expectOne(`${baseUrl}/vacation/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    const remainingReq = httpMock.expectOne(
      `${baseUrl}/vacation/user/remaining/1`
    );
    remainingReq.flush(20);

    tick();

    expect(service.futureVacations$().length).toBe(0);
    expect(service.pastVacations$().length).toBe(0);
    expect(service.remainingDays()).toBe(20);
  }));

  it('should navigate to error page on add vacation error', fakeAsync(() => {
    service.addVacation({
      startDate: new Date(),
      endDate: new Date(),
      description: 'Vacation',
      status: 'pending',
    });

    const req = httpMock.expectOne(`${baseUrl}/vacation`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should not load vacations if user is not logged in', () => {
    userDataService.isLoggedIn.and.returnValue(false);

    service.loadVacations();

    httpMock.expectNone(`${baseUrl}/vacation/user/1/FUTURE`);
    httpMock.expectNone(`${baseUrl}/vacation/user/1/PAST`);
    httpMock.expectNone(`${baseUrl}/vacation/user/remaining/1`);
  });
});
