import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditSessionComponent } from './edit-session.component';
import { WorkLogService } from '../../../service/work-log.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';

describe('EditSessionComponent', () => {
  let component: any;
  let fixture: ComponentFixture<EditSessionComponent>;
  let workLogServiceSpy: jasmine.SpyObj<WorkLogService>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    workLogServiceSpy = jasmine.createSpyObj('WorkLogService', ['editSession']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [EditSessionComponent],
      providers: [
        { provide: WorkLogService, useValue: workLogServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form on session change', () => {
    const testDate = new Date(2023, 0, 1, 9, 0);
    component.session = {
      date: testDate,
      timeWorked: 2 * 60 * 60 * 1000, // 2 hours
    };
    component.ngOnChanges({
      session: {
        currentValue: component.session,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    expect(component.form.get('startTime').value).toBe('09:00');
    expect(component.form.get('endTime').value).toBe('11:00');
  });

  it('should compute endTime correctly', () => {
    const date = new Date(2023, 0, 1, 8, 0);
    component.session = {
      date,
      timeWorked: 3 * 60 * 60 * 1000, // 3 hours
    };
    expect(component.endTime).toBe(date.getTime() + 3 * 60 * 60 * 1000);
  });

  it('should compute editedWorkTime correctly', () => {
    component.form.setValue({
      startTime: '08:00',
      endTime: '16:00',
    });
    const editedTime = component.editedWorkTime;
    expect(editedTime.getUTCHours()).toBe(8);
  });

  it('should not submit if form invalid', () => {
    component.form.setErrors({ required: true });
    component.onSubmit();
    expect(workLogServiceSpy.editSession).not.toHaveBeenCalled();
  });

  it('should set invalidTimeRange error if endTime before startTime', () => {
    component.form.setValue({
      startTime: '10:00',
      endTime: '09:00',
    });
    component.session = {
      date: new Date(),
      timeWorked: 0,
    };

    component.onSubmit();

    expect(component.form.get('endTime').errors.invalidTimeRange).toBeTrue();
    expect(workLogServiceSpy.editSession).not.toHaveBeenCalled();
  });

  it('should reset endTime if session duration exceeds 8 hours', () => {
    component.form.setValue({
      startTime: '09:00',
      endTime: '18:30',
    });
    component.session = {
      date: new Date(),
      timeWorked: 0,
    };

    component.onSubmit();

    expect(component.form.get('endTime').value).toBeNull();
    expect(workLogServiceSpy.editSession).not.toHaveBeenCalled();
  });

  it('should submit valid form and call editSession and emit closeWindow', () => {
    component.form.setValue({
      startTime: '09:00',
      endTime: '17:00',
    });
    component.session = {
      date: new Date(),
      timeWorked: 0,
    };
    spyOn(component.closeWindow, 'emit');

    component.onSubmit();

    expect(workLogServiceSpy.editSession).toHaveBeenCalledWith(
      component.session!,
      jasmine.any(Date),
      jasmine.any(Date)
    );
    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Session edited successfully !',
      '',
      { duration: 2000 }
    );
    expect(component.closeWindow.emit).toHaveBeenCalled();
  });

  it('should reset form values to session values onReset', () => {
    const testDate = new Date(2023, 0, 1, 9, 0);
    component.session = {
      date: testDate,
      timeWorked: 2 * 60 * 60 * 1000, // 2 hours
    };
    component.onReset();

    expect(component.form.get('startTime').value).toBe('09:00');
    expect(component.form.get('endTime').value).toBe('11:00');
  });

  it('should emit closeWindow on onCloseWindow', () => {
    spyOn(component.closeWindow, 'emit');
    component.onCloseWindow();
    expect(component.closeWindow.emit).toHaveBeenCalled();
  });
});
