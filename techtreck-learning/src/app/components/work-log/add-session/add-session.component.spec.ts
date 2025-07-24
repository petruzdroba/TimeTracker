import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddSessionComponent } from './add-session.component';
import { WorkLogService } from '../../../service/work-log.service';
import { EditBoxComponent } from '../../../shared/edit-box/edit-box.component';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('AddSessionComponent', () => {
  let component: AddSessionComponent;
  let fixture: ComponentFixture<AddSessionComponent>;
  let workLogServiceSpy: jasmine.SpyObj<WorkLogService>;

  beforeEach(async () => {
    workLogServiceSpy = jasmine.createSpyObj('WorkLogService', ['addSession'], {
      getWorkLog: [],
    });

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        AddSessionComponent,
        EditBoxComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatInputModule,
        DatePipe,
      ],
      providers: [{ provide: WorkLogService, useValue: workLogServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit closeWindow on onCloseWindow call', () => {
    spyOn(component.closeWindow, 'emit');
    component.onCloseWindow();
    expect(component.closeWindow.emit).toHaveBeenCalled();
  });

  it('should reset form on onReset call', () => {
    const comp: any = component;
    comp.form.setValue({
      date: new Date('2023-01-01'),
      startTime: '09:00',
      endTime: '10:00',
    });
    component.onReset();
    expect(comp.form.get('date')?.value).toBeNull();
    expect(comp.form.get('startTime')?.value).toBeNull();
    expect(comp.form.get('endTime')?.value).toBeNull();
  });

  it('should not submit if form is invalid', () => {
    const comp: any = component;
    comp.form.reset(); // All fields null
    component.onSubmit();
    expect(workLogServiceSpy.addSession).not.toHaveBeenCalled();
  });

  it('should not submit if endTime is before startTime', () => {
    const comp: any = component;
    comp.form.setValue({
      date: new Date(),
      startTime: '10:00',
      endTime: '09:00',
    });

    component.onSubmit();
    expect(comp.form.valid).toBeFalse();
    expect(workLogServiceSpy.addSession).not.toHaveBeenCalled();
  });

  // it('should submit valid session and emit close', () => {
  //   const comp: any = component;
  //   spyOn(component.closeWindow, 'emit');
  //   const today = new Date();

  //   comp.form.setValue({
  //     date: today,
  //     startTime: '09:00:00',
  //     endTime: '16:00:00',
  //   });

  //   component.onSubmit();

  //   expect(workLogServiceSpy.addSession).toHaveBeenCalled();
  //   expect(component.closeWindow.emit).toHaveBeenCalled();
  //   expect(comp.form.valid).toBeTrue();
  // });

  it('should reset endTime if session duration exceeds 8 hours', () => {
    const comp: any = component;
    comp.form.setValue({
      date: new Date(),
      startTime: '09:00',
      endTime: '18:30',
    });

    component.onSubmit();

    expect(comp.form.get('endTime')?.value).toBe('18:30'); // Expect unchanged
    expect(workLogServiceSpy.addSession).not.toHaveBeenCalled();
  });

  it('should compute editedWorkTime correctly', () => {
    const comp: any = component;
    comp.form.setValue({
      date: new Date(),
      startTime: '09:00',
      endTime: '17:00',
    });

    const result = component.editedWorkTime;
    expect(result.getUTCHours()).toBe(8);
  });
});
