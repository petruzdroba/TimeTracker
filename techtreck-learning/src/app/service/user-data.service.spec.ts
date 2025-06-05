import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { UserDataService } from './user-data.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserData } from '../model/user-data.interface';
import { of, throwError } from 'rxjs';

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

  it('should save user data with remember me', () => {
    service.saveUserData(mockUserData, true);

    expect(service.user().id).toBe(mockUserData.id);
    expect(service.isLoggedIn()).toBeTrue();

    const remembered = localStorage.getItem('rememberMe');
    expect(remembered).toBeTruthy();
    expect(JSON.parse(remembered!)).toEqual({
      rememberMe: true,
      id: mockUserData.id,
    });
  });

  it('should log in user', fakeAsync(() => {
    const loginData = { email: 'test@test.com', password: 'password' };
    httpClientSpy.post.and.returnValue(of(mockUserData));

    service.logIn(loginData).subscribe((response) => {
      expect(response).toEqual(mockUserData);
    });

    tick();
    expect(httpClientSpy.post).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/auth/login/',
      loginData
    );
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
      'http://127.0.0.1:8000/auth/signup/',
      signupData
    );
  }));

  it('should check remembered user', fakeAsync(() => {
    localStorage.setItem(
      'rememberMe',
      JSON.stringify({
        rememberMe: true,
        id: 1,
      })
    );

    httpClientSpy.get.and.returnValue(of(mockUserData));
    service.checkRememberedUser();
    tick();

    expect(service.user()).toEqual(mockUserData);
    expect(httpClientSpy.get).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/auth/getuser/1/'
    );
  }));

  it('should handle remember user error', fakeAsync(() => {
    localStorage.setItem(
      'rememberMe',
      JSON.stringify({
        rememberMe: true,
        id: 1,
      })
    );

    httpClientSpy.get.and.returnValue(throwError(() => ({ status: 404 })));
    service.checkRememberedUser();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/error', 404]);
  }));

  it('should logout user', () => {
    service.saveUserData(mockUserData, true);

    spyOn(service, 'reloadPage'); // Spy on the wrapper, not window.location

    service.logout();

    expect(localStorage.getItem('userData')).toBeNull();
    expect(localStorage.getItem('rememberMe')).toBeNull();
    expect(localStorage.getItem('timerData')).toBeNull();
    expect(service.user().id).toBe(-1);
    expect(service.reloadPage).toHaveBeenCalled();
  });

  it('should check user roles', () => {
    const adminUser = { ...mockUserData, role: 'admin' };
    const managerUser = { ...mockUserData, role: 'manager' };

    service.saveUserData(adminUser, false);
    expect(service.isAdmin()).toBeTrue();
    expect(service.isManager()).toBeFalse();

    service.saveUserData(managerUser, false);
    expect(service.isAdmin()).toBeFalse();
    expect(service.isManager()).toBeTrue();
  });
});
