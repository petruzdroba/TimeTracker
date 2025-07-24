import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { InfoComponent } from './info.component';
import { UserDataService } from '../../../service/user-data.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

describe('InfoComponent', () => {
  let component: InfoComponent;
  let fixture: ComponentFixture<InfoComponent>;
  let userDataServiceSpy: jasmine.SpyObj<UserDataService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userDataServiceSpy = jasmine.createSpyObj('UserDataService', [
      'user',
      'delete',
      'logout',
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [InfoComponent, NoopAnimationsModule, ReactiveFormsModule],
      providers: [
        { provide: UserDataService, useValue: userDataServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoComponent);
    component = fixture.componentInstance;

    // Mock user data
    userDataServiceSpy.user.and.returnValue({
      id: 123,
      name: 'Test User',
      email: 'test@example.com',
      workHours: 8,
      vacationDays: 20,
      personalTime: 5,
      role: 'user',
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should logout and emit close on onLogout()', () => {
    spyOn(component.close, 'emit');
    component.onLogout();
    expect(userDataServiceSpy.logout).toHaveBeenCalled();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should set showDialog to true when onShowDialog() is called', () => {
    component['showDialog'] = false;
    component.onShowDialog();
    expect(component['showDialog']).toBeTrue();
  });

  it('should set showDialog to false when onHideDialog() is called', () => {
    component['showDialog'] = true;
    component.onHideDialog();
    expect(component['showDialog']).toBeFalse();
  });

  it('should call delete and logout on successful account deletion', fakeAsync(() => {
    component['form'].setValue({ password: 'testpass' });
    userDataServiceSpy.delete.and.returnValue(of({}));

    component.onDelete();
    tick(1500); // simulate delay

    expect(userDataServiceSpy.delete).toHaveBeenCalledWith('testpass');
    expect(userDataServiceSpy.logout).toHaveBeenCalled();
  }));

  it('should handle delete error with 401 and navigate to error route', fakeAsync(() => {
    const errorResponse = { status: 401 };
    component['form'].setValue({ password: 'wrongpass' });
    userDataServiceSpy.delete.and.returnValue(throwError(() => errorResponse));

    spyOn(component.close, 'emit');

    component.onDelete();
    tick(500); // simulate delay

    expect(userDataServiceSpy.logout).toHaveBeenCalled();
    expect(component.close.emit).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/error', 401]);
  }));

  it('should not call delete if password is empty', () => {
    component['form'].setValue({ password: '' });
    component.onDelete();
    expect(userDataServiceSpy.delete).not.toHaveBeenCalled();
  });
});
