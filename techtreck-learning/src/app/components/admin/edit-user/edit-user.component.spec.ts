import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditUserComponent } from './edit-user.component';
import { AdminService } from '../../../service/admin.service';
import { UserData } from '../../../model/user-data.interface';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EditUserComponent', () => {
  let component: EditUserComponent;
  let fixture: ComponentFixture<EditUserComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;

  const mockUser: UserData = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'employee',
    workHours: 8,
    personalTime: 60,
    vacationDays: 10,
  };

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', ['updateUser']);

    await TestBed.configureTestingModule({
      imports: [EditUserComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [{ provide: AdminService, useValue: adminServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(EditUserComponent);
    component = fixture.componentInstance;
    component.user = mockUser;
    component.isOpen = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form values on user input change', () => {
    const newUser = { ...mockUser, workHours: 6, role: 'manager' };
    component.user = newUser;
    (component as any).ngOnChanges({
      user: {
        currentValue: newUser,
        previousValue: mockUser,
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    expect((component as any).form.value.workHours).toBe(6);
    expect((component as any).form.value.role).toBe('manager');
  });

  it('should call adminService.updateUser on valid form submit', async () => {
    adminServiceSpy.updateUser.and.returnValue(Promise.resolve());

    (component as any).form.setValue({
      workHours: 7,
      personalTime: 30,
      vacationDays: 5,
      role: 'manager',
    });

    component.user = { ...mockUser };
    await (component as any).onSubmit();

    expect(adminServiceSpy.updateUser).toHaveBeenCalledWith(
      jasmine.objectContaining({
        workHours: 7,
        personalTime: 30,
        vacationDays: 5,
        role: 'manager',
      })
    );
  });

  it('should NOT call updateUser on invalid form submit', async () => {
    adminServiceSpy.updateUser.calls.reset();

    (component as any).form.setValue({
      workHours: null as any,
      personalTime: 30,
      vacationDays: 5,
      role: 'manager',
    });

    component.user = { ...mockUser };
    await (component as any).onSubmit();

    expect(adminServiceSpy.updateUser).not.toHaveBeenCalled();
  });

  it('should reset form to original user values', () => {
    (component as any).form.setValue({
      workHours: 5,
      personalTime: 0,
      vacationDays: 0,
      role: 'manager',
    });

    component.user = mockUser;
    (component as any).onReset();

    expect((component as any).form.value.workHours).toBe(mockUser.workHours);
    expect((component as any).form.value.role).toBe(mockUser.role);
  });

  it('should emit closeWindow on onCloseWindow call', () => {
    spyOn(component.closeWindow, 'emit');
    (component as any).onCloseWindow();
    expect(component.closeWindow.emit).toHaveBeenCalled();
  });
});
