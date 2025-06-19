import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserDataService } from './user-data.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserData } from '../model/user-data.interface';
import { of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

describe('UserDataService', () => {
  let service: UserDataService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerMock: jasmine.SpyObj<Router>;

  const mockUserData: UserData = {
    id: 1,
    name: 'Test User',
    email: 'test@test.com',
    workHours: 8,
    vacationDays: 20,
    personalTime: 5,
    role: 'user',
  };

  const mockAuthResponse = {
    access: 'mock-access-token',
    refresh: 'mock-refresh-token',
    user: mockUserData,
  };

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        UserDataService,
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(UserDataService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in user and store tokens', fakeAsync(() => {
    const loginData = { email: 'test@test.com', password: 'password' };
    httpClientSpy.post.and.returnValue(of(mockAuthResponse));

    service.logIn(loginData).subscribe((response) => {
      expect(response).toEqual(mockUserData);
    });

    tick();

    expect(httpClientSpy.post).toHaveBeenCalledWith(
      `${environment.apiUrl}/auth/login/`,
      loginData
    );
    expect(localStorage.getItem('authToken')).toBe('mock-access-token');
    expect(localStorage.getItem('refreshToken')).toBe('mock-refresh-token');
    expect(service.user()).toEqual(mockUserData);
  }));

  it('should sign up user', fakeAsync(() => {
    const signupData = {
      name: 'Test User',
      email: 'test@test.com',
      password: 'password',
    };
    httpClientSpy.post.and.returnValue(of({ success: true }));

    service.signUp(signupData).subscribe((response) => {
      expect(response).toEqual({ success: true });
    });

    tick();
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      `${environment.apiUrl}/auth/signup/`,
      signupData
    );
  }));

  it('should check remembered user with valid token', fakeAsync(() => {
    localStorage.setItem('authToken', 'valid-token');
    httpClientSpy.get.and.returnValue(of(mockUserData));

    service.checkRememberedUser();
    tick();

    expect(service.user()).toEqual(mockUserData);
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      `${environment.apiUrl}/auth/me/`
    );
  }));

  it('should handle remembered user error by logging out', fakeAsync(() => {
    localStorage.setItem('authToken', 'invalid-token');
    httpClientSpy.get.and.returnValue(
      throwError(() => new Error('Invalid token'))
    );

    service.checkRememberedUser();
    tick();

    expect(service.user().id).toBe(-1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth']);
  }));

  it('should logout user', () => {
    // Setup initial state
    localStorage.setItem('authToken', 'token');
    localStorage.setItem('refreshToken', 'refresh');
    localStorage.setItem('timerData', 'data');
    service['userData'].set(mockUserData);

    service.logout();

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('timerData')).toBeNull();
    expect(service.user()).toEqual({
      id: -1,
      name: 'NoUser',
      email: 'NoEmail',
      workHours: 0,
      vacationDays: 0,
      personalTime: 0,
      role: 'NoRole',
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('should check user roles', () => {
    const adminUser = { ...mockUserData, role: 'admin' };
    const managerUser = { ...mockUserData, role: 'manager' };

    service['userData'].set(adminUser);
    expect(service.isAdmin()).toBeTrue();
    expect(service.isManager()).toBeFalse();

    service['userData'].set(managerUser);
    expect(service.isAdmin()).toBeFalse();
    expect(service.isManager()).toBeTrue();
  });

  it('should call delete API', fakeAsync(() => {
    const password = 'testpassword123';
    service['userData'].set(mockUserData);

    const deleteResponse = { detail: 'User deleted' };
    httpClientSpy.post.and.returnValue(of(deleteResponse));

    service.delete(password).subscribe((response) => {
      expect(response).toEqual(deleteResponse);
    });

    tick();

    expect(httpClientSpy.post).toHaveBeenCalledWith(
      `${environment.apiUrl}/user/delete/`,
      { userId: mockUserData.id, password }
    );
  }));
});
