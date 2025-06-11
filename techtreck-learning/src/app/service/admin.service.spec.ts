import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AdminService } from './admin.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserData } from '../model/user-data.interface';

describe('AdminService', () => {
  let service: AdminService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUserList: UserData[] = [
    {
      id: 1,
      name: 'Admin One',
      email: 'admin1@example.com',
      workHours: 8,
      vacationDays: 20,
      personalTime: 5,
      role: 'admin',
    },
  ];

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'put']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    httpClientSpy.get.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        AdminService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch admin data successfully', fakeAsync(() => {
    httpClientSpy.get.and.returnValue(of(mockUserList));

    service.initialize().then(() => {
      expect(service.getAdminData()).toEqual(mockUserList);
      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/adminfe/get/'
      );
    });

    tick();
  }));

  it('should handle fetch admin data error', fakeAsync(() => {
    httpClientSpy.get.and.returnValue(throwError(() => ({ status: 500 })));

    service.initialize().catch((err) => {
      expect(err.status).toBe(500);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/500']);
    });

    tick();
  }));

  it('should update user data and refetch admin data on success', fakeAsync(() => {
    const updatedUser = mockUserList[0];
    httpClientSpy.put.and.returnValue(of(updatedUser));
    httpClientSpy.get.and.returnValue(of(mockUserList));

    service.updateUser(updatedUser).then(() => {
      expect(httpClientSpy.put).toHaveBeenCalledWith(
        'http://127.0.0.1:8000/user/update/',
        { data: updatedUser }
      );
      expect(httpClientSpy.get).toHaveBeenCalled(); // Ensures re-fetching after update
    });

    tick();
  }));

  it('should handle user update error', fakeAsync(() => {
    const updatedUser = mockUserList[0];
    httpClientSpy.put.and.returnValue(throwError(() => ({ status: 403 })));

    service.updateUser(updatedUser).catch((err) => {
      expect(err.status).toBe(403);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/error/403']);
    });

    tick();
  }));

  it('should unsubscribe on destroy', () => {
    const subscriptionMock = jasmine.createSpyObj('Subscription', [
      'unsubscribe',
    ]);
    (service as any).subscription = subscriptionMock;

    service.ngOnDestroy();

    expect(subscriptionMock.unsubscribe).toHaveBeenCalled();
  });
});
