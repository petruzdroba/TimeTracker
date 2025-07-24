import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { UserDataService } from '../../../service/user-data.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserData } from '../../../model/user-data.interface';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<UserDataService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: UserData = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    workHours: 40,
    vacationDays: 10,
    personalTime: 5,
    role: 'user',
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('UserDataService', ['logIn']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDataService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset form and clear error on reset', () => {
    // Workaround for protected form property: access with type casting
    (component as any).form.setValue({
      email: 'test@test.com',
      password: '123456',
    });
    component['error'] = 'Some error';
    component.onReset();
    expect((component as any).form.value).toEqual({
      email: null,
      password: null,
    });
    expect(component['error']).toBeNull();
  });

  it('should not submit if form is invalid', () => {
    (component as any).form.setValue({ email: '', password: '' });
    spyOn(console, 'log');
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('INVALID FORM');
    expect(authServiceSpy.logIn).not.toHaveBeenCalled();
  });

  it('should submit and navigate on successful login', () => {
    (component as any).form.setValue({
      email: 'test@example.com',
      password: 'secret',
    });
    authServiceSpy.logIn.and.returnValue(of(mockUser));

    spyOn(component, 'closeWindow');
    component.onSubmit();

    expect(authServiceSpy.logIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'secret',
    });
    expect(component['error']).toBeNull();
    expect(component.closeWindow).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle 401 error with invalid credentials message', () => {
    (component as any).form.setValue({
      email: 'wrong@example.com',
      password: 'wrong',
    });
    authServiceSpy.logIn.and.returnValue(throwError(() => ({ status: 401 })));

    component.onSubmit();

    expect(component['error']).toBe('Invalid email or password');
    expect((component as any).form.value).toEqual({
      email: null,
      password: null,
    });
  });

  it('should handle 404 error with user not found message', () => {
    (component as any).form.setValue({
      email: 'missing@example.com',
      password: 'any',
    });
    authServiceSpy.logIn.and.returnValue(throwError(() => ({ status: 404 })));

    component.onSubmit();

    expect(component['error']).toBe('User not found');
    expect((component as any).form.value).toEqual({
      email: null,
      password: null,
    });
  });

  it('should handle other errors with generic message', () => {
    (component as any).form.setValue({
      email: 'user@example.com',
      password: 'pass',
    });
    authServiceSpy.logIn.and.returnValue(throwError(() => ({ status: 500 })));

    component.onSubmit();

    expect(component['error']).toBe(
      'An error occurred. Please try again later.'
    );
  });

  it('should toggle hidePassword', () => {
    expect(component.hidePassword).toBeTrue();
    component.hidePassword = !component.hidePassword;
    expect(component.hidePassword).toBeFalse();
  });

  it('should emit close event when closeWindow is called', () => {
    spyOn(component.close, 'emit');
    component.closeWindow();
    expect(component.close.emit).toHaveBeenCalled();
  });
});
