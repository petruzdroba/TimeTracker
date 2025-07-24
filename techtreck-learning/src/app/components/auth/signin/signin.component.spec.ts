import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SigninComponent } from './signin.component';
import { UserDataService } from '../../../service/user-data.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { UserData } from '../../../model/user-data.interface';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('SigninComponent', () => {
  let component: SigninComponent;
  let fixture: ComponentFixture<SigninComponent>;
  let authServiceSpy: jasmine.SpyObj<UserDataService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockSignupResponse = {};

  const mockLoginResponse: UserData = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    workHours: 40,
    vacationDays: 10,
    personalTime: 5,
    role: 'user',
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('UserDataService', [
      'signUp',
      'logIn',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SigninComponent, BrowserAnimationsModule],
      providers: [
        { provide: UserDataService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset form and clear error on reset', () => {
    (component as any).form.setValue({
      name: 'Test Name',
      email: 'test@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    component['error'] = 'Some error';
    component.onReset();
    expect((component as any).form.value).toEqual({
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
    });
    expect(component['error']).toBeNull();
  });

  it('should not submit if form is invalid', () => {
    (component as any).form.setValue({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    spyOn(console, 'log');
    component.onSubmit();
    expect(console.log).toHaveBeenCalledWith('INVALID FORM');
    expect(authServiceSpy.signUp).not.toHaveBeenCalled();
    expect(authServiceSpy.logIn).not.toHaveBeenCalled();
  });

  it('should submit and auto-login on successful signup', () => {
    (component as any).form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    authServiceSpy.signUp.and.returnValue(of(mockSignupResponse));
    authServiceSpy.logIn.and.returnValue(of(mockLoginResponse));

    spyOn(component, 'closeWindow');
    component.onSubmit();

    expect(authServiceSpy.signUp).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(authServiceSpy.logIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(component['error']).toBeNull();
    expect(component.closeWindow).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle 409 error with email exists message', () => {
    (component as any).form.setValue({
      name: 'Test User',
      email: 'exists@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    authServiceSpy.signUp.and.returnValue(throwError(() => ({ status: 409 })));

    component.onSubmit();

    expect(component['error']).toBe('Email already exists');
    expect((component as any).form.get('email')?.value).toBeNull();
  });

  it('should handle generic signup error', () => {
    (component as any).form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    authServiceSpy.signUp.and.returnValue(throwError(() => ({ status: 500 })));

    component.onSubmit();

    expect(component['error']).toBe(
      'An error occurred. Please try again later.'
    );
  });

  it('should handle login failure after signup', () => {
    (component as any).form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    authServiceSpy.signUp.and.returnValue(of(mockSignupResponse));
    authServiceSpy.logIn.and.returnValue(throwError(() => ({ status: 401 })));

    spyOn(console, 'error');
    component.onSubmit();

    expect(component['error']).toBe('Login failed after sign up.');
    expect(console.error).toHaveBeenCalledWith(
      'Auto-login error:',
      jasmine.any(Object)
    );
  });

  it('should toggle hidePassword and hideConfirmPassword', () => {
    expect(component.hidePassword).toBeTrue();
    expect(component.hideConfirmPassword).toBeTrue();

    component.hidePassword = !component.hidePassword;
    component.hideConfirmPassword = !component.hideConfirmPassword;

    expect(component.hidePassword).toBeFalse();
    expect(component.hideConfirmPassword).toBeFalse();
  });

  it('should emit close event when closeWindow is called', () => {
    spyOn(component.close, 'emit');
    component.closeWindow();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should invalidate form if passwords do not match', () => {
    (component as any).form.setValue({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'differentPassword',
    });

    const errors = (component as any).form.errors;
    expect(errors).toEqual({ passwordMismatch: true });

    const confirmPasswordErrors = (component as any).form.get(
      'confirmPassword'
    )?.errors;
    expect(confirmPasswordErrors).toEqual({ passwordMismatch: true });
  });
});
