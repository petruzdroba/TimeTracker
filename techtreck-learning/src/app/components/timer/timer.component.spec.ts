import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { TimerComponent } from './timer.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TimerService } from '../../service/timer.service';
import { WorkLogService } from '../../service/work-log.service';
import { TimerData } from '../../model/timer-data.interface';
import { Session } from '../../model/session.interface';
import { DatePipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('TimerComponent', () => {
  let component: TimerComponent;
  let fixture: ComponentFixture<TimerComponent>;
  let timerServiceMock: jasmine.SpyObj<TimerService>;
  let workLogServiceMock: jasmine.SpyObj<WorkLogService>;
  let snackBarMock: jasmine.SpyObj<MatSnackBar>;

  beforeEach(async () => {
    timerServiceMock = jasmine.createSpyObj(
      'TimerService',
      ['updateTimerData', 'workingHoursFull'],
      { timer: { timerType: 'OFF', requiredTime: 28800000 } as TimerData }
    );

    workLogServiceMock = jasmine.createSpyObj(
      'WorkLogService',
      ['initialize', 'addSession'],
      { getWorkLog: [] as Session[], firstClockIn: undefined }
    );

    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    spyOn(window.localStorage, 'getItem').and.returnValue(
      JSON.stringify({ timerType: 'OFF', requiredTime: 28800000 })
    );

    await TestBed.configureTestingModule({
      imports: [TimerComponent, MatSnackBarModule, DatePipe],
      providers: [
        { provide: TimerService, useValue: timerServiceMock },
        { provide: WorkLogService, useValue: workLogServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start the timer and update state', fakeAsync(() => {
    (component as any).TIME_REQ = 28800000;

    (component as any).startTimer();
    tick(1000); // allow one interval tick

    expect(timerServiceMock.updateTimerData).toHaveBeenCalled();
    expect(workLogServiceMock.addSession).toHaveBeenCalled();
    expect((component as any).timerData().timerType).toBe('ON');

    // clean up the interval without letting it keep firing
    component.ngOnDestroy();
    discardPeriodicTasks();
  }));

  it('should pause the timer, save session, show snackbar, and schedule reload', fakeAsync(() => {
    (component as any).TIME_REQ = 28800000;
    (component as any).timerData.set({
      timerType: 'ON',
      requiredTime: 28700000,
      startTime: new Date(),
    } as TimerData);

    // Spy on setTimeout via any-cast to satisfy TS signature
    const setTimeoutSpy = spyOn(window as any, 'setTimeout').and.callFake(
      (fn: any, delay: number) => {
        expect(typeof fn).toBe('function');
        expect(delay).toBe(2000);
        return 123; // dummy ID
      }
    );

    component.pauseTimer();
    tick(0); // execute immediate logic

    expect(timerServiceMock.updateTimerData).toHaveBeenCalled();
    expect(workLogServiceMock.addSession).toHaveBeenCalled();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Session recorded successfully!',
      '',
      { duration: 2000 }
    );
    expect(setTimeoutSpy).toHaveBeenCalled();

    // No real timer queued, so fakeAsync won't complain
  }));
});
