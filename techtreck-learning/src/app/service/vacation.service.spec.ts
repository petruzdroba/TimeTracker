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

  it('should load vacations', fakeAsync(() => {
    const mockVacations: Vacation[] = [
      {
        id: 1,
        startDate: new Date(Date.now() + 86400000),
        endDate: new Date(Date.now() + 172800000),
        status: 'pending',
        description: 'Vacation 1',
      },
    ];

    service.loadVacations();

    const vacationsReq = httpMock.expectOne(`${baseUrl}/vacations/1`);
    expect(vacationsReq.request.method).toBe('GET');
    vacationsReq.flush(mockVacations);

    const remainingReq = httpMock.expectOne(`${baseUrl}/vacations/1/remaining`);
    expect(remainingReq.request.method).toBe('GET');
    remainingReq.flush({ remainingVacationDays: 15 });

    tick();

    expect(service.vacations().length).toBe(1);
    expect(service.vacations()[0].description).toBe('Vacation 1');
    expect(service.remainingDays()).toBe(15);
  }));

  it('should handle fetch vacation data error', fakeAsync(() => {
    service.loadVacations();

    const vacationsReq = httpMock.expectOne(`${baseUrl}/vacations/1`);
    vacationsReq.flush('Error fetching', { status: 500, statusText: 'Server Error' });

    const remainingReq = httpMock.expectOne(`${baseUrl}/vacations/1/remaining`);
    remainingReq.flush('Error', { status: 500, statusText: 'Server Error' });

    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should add a vacation', fakeAsync(() => {
    const newVacation: Vacation = {
      id: 1,
      startDate: new Date(),
      endDate: new Date(),
      status: 'pending',
      description: 'New Vacation',
    };

    service.addVacation({
      startDate: newVacation.startDate,
      endDate: newVacation.endDate,
      status: newVacation.status,
      description: newVacation.description,
    });

    const addReq = httpMock.expectOne(`${baseUrl}/vacations`);
    expect(addReq.request.method).toBe('POST');
    expect(addReq.request.body.userId).toBe(1);
    addReq.flush(newVacation);

    const remainingReq = httpMock.expectOne(`${baseUrl}/vacations/1/remaining`);
    remainingReq.flush({ remainingVacationDays: 18 });

    tick();

    expect(service.vacations().length).toBe(1);
    expect(service.vacations()[0].description).toBe('New Vacation');
    expect(service.remainingDays()).toBe(18);
  }));

  it('should update a vacation', fakeAsync(() => {
    // First add a vacation
    const existingVacation: Vacation = {
      id: 1,
      startDate: new Date(),
      endDate: new Date(),
      status: 'pending',
      description: 'Old Description',
    };

    service.addVacation(existingVacation);
    const addReq = httpMock.expectOne(`${baseUrl}/vacations`);
    addReq.flush(existingVacation);
    httpMock.expectOne(`${baseUrl}/vacations/1/remaining`).flush({ remainingVacationDays: 18 });
    tick();

    // Now update it
    const updatedVacation: Vacation = {
      ...existingVacation,
      description: 'New Description',
    };

    service.updateVacation(1, { description: 'New Description' });

    const updateReq = httpMock.expectOne(`${baseUrl}/vacations/1`);
    expect(updateReq.request.method).toBe('PUT');
    updateReq.flush(updatedVacation);

    const remainingReq = httpMock.expectOne(`${baseUrl}/vacations/1/remaining`);
    remainingReq.flush({ remainingVacationDays: 18 });

    tick();

    expect(service.vacations()[0].description).toBe('New Description');
  }));

  it('should delete a vacation', fakeAsync(() => {
    // First add a vacation
    const vacation: Vacation = {
      id: 1,
      startDate: new Date(),
      endDate: new Date(),
      status: 'pending',
      description: 'Vacation',
    };

    service.addVacation(vacation);
    const addReq = httpMock.expectOne(`${baseUrl}/vacations`);
    addReq.flush(vacation);
    httpMock.expectOne(`${baseUrl}/vacations/1/remaining`).flush({ remainingVacationDays: 18 });
    tick();

    expect(service.vacations().length).toBe(1);

    // Now delete it
    service.deleteVacation(1);

    const deleteReq = httpMock.expectOne(`${baseUrl}/vacations/1`);
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    const remainingReq = httpMock.expectOne(`${baseUrl}/vacations/1/remaining`);
    remainingReq.flush({ remainingVacationDays: 20 });

    tick();

    expect(service.vacations().length).toBe(0);
    expect(service.remainingDays()).toBe(20);
  }));

  it('should navigate to error page on add vacation error', fakeAsync(() => {
    service.addVacation({
      startDate: new Date(),
      endDate: new Date(),
      status: 'pending',
      description: 'Vacation',
    });

    const req = httpMock.expectOne(`${baseUrl}/vacations`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    tick();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 500]);
  }));

  it('should not load vacations if user is not logged in', () => {
    userDataService.isLoggedIn.and.returnValue(false);

    service.loadVacations();

    httpMock.expectNone(`${baseUrl}/vacations/1`);
  });
});
