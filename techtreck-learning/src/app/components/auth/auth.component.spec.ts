import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthComponent } from './auth.component';
import { UserDataService } from '../../service/user-data.service';
import { Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('AuthComponent', () => {
  let component: AuthComponent;
  let fixture: ComponentFixture<AuthComponent>;
  let userDataServiceSpy: jasmine.SpyObj<UserDataService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    userDataServiceSpy = jasmine.createSpyObj('UserDataService', [
      'isLoggedIn',
    ]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      // Define a getter for url property to avoid readonly errors
      get url() {
        return '/default-route';
      },
    });

    await TestBed.configureTestingModule({
      imports: [AuthComponent, NoopAnimationsModule],
      providers: [
        { provide: UserDataService, useValue: userDataServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event when closeWindow is called', () => {
    spyOn(component.close, 'emit');
    component.closeWindow();
    expect(component.close.emit).toHaveBeenCalled();
  });

  describe('isLoggedIn getter', () => {
    it('should return true when userDataService.isLoggedIn returns true', () => {
      userDataServiceSpy.isLoggedIn.and.returnValue(true);
      expect(component.isLoggedIn).toBeTrue();
    });

    it('should return false when userDataService.isLoggedIn returns false', () => {
      userDataServiceSpy.isLoggedIn.and.returnValue(false);
      expect(component.isLoggedIn).toBeFalse();
    });
  });

  describe('currentRoute getter', () => {
    it('should return router.url', () => {
      Object.defineProperty(routerSpy, 'url', {
        get: () => '/auth',
      });
      expect(component.currentRoute).toBe('/auth');
    });

    it('should return updated router.url', () => {
      Object.defineProperty(routerSpy, 'url', {
        get: () => '/other-route',
      });
      expect(component.currentRoute).toBe('/other-route');
    });
  });
});
