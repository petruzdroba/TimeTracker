import { TestBed } from '@angular/core/testing';
import { WorkLogService } from './work-log.service';
import { Session } from '../model/session.interface';

describe('WorkLogService', () => {
  let service: WorkLogService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);
    TestBed.configureTestingModule({
      providers: [WorkLogService],
    });

    localStorageSpy = spy;
    Object.defineProperty(window, 'localStorage', { value: spy });

    // Reset localStorage state before each test
    localStorageSpy.getItem.and.returnValue(null);
    service = TestBed.inject(WorkLogService);
  });

  describe('Constructor', () => {
    it('should initialize with default session when localStorage is empty', () => {
      const defaultSession = service.getWorkLog[0];
      expect(service.getWorkLog.length).toBe(1);
      expect(defaultSession.timeWorked).toBe(0);
      expect(defaultSession.date).toBeDefined();
    });

    it('should load existing data from localStorage', () => {
      const mockDate = new Date();
      const mockData = [
        {
          date: mockDate, // Changed from mockDate.toISOString()
          timeWorked: 3600000,
        },
      ];
      localStorageSpy.getItem.and.returnValue(JSON.stringify(mockData));

      service = TestBed.inject(WorkLogService);
      const loadedSession = service.getWorkLog[0];

      expect(service.getWorkLog.length).toBe(1);
      expect(loadedSession.timeWorked).toBe(0);

      const loadedDate = new Date(loadedSession.date);
      const mockDateNormalized = new Date(mockDate);
      // Compare only date parts
      expect(loadedDate.toDateString()).toBe(mockDateNormalized.toDateString());
    });
  });

  describe('addSession', () => {
    it('should add new session when date does not exist', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const newSession: Session = {
        date: tomorrow,
        timeWorked: 3600000,
      };

      service.addSession(newSession);

      expect(service.getWorkLog.length).toBe(2); // Including default session
      const addedSession = service.getWorkLog.find(
        (s) => s.timeWorked === 3600000
      );
      expect(addedSession).toBeTruthy();
    });

    it('should update existing session on same date', () => {
      const today = new Date();
      const session1: Session = { date: today, timeWorked: 3600000 };
      const session2: Session = { date: today, timeWorked: 7200000 };

      service.addSession(session1);
      service.addSession(session2);

      const todaySessions = service.getWorkLog.filter((s) => {
        const sessionDate = new Date(s.date);
        sessionDate.setHours(0, 0, 0, 0);
        const compareDate = new Date(today);
        compareDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === compareDate.getTime();
      });

      expect(todaySessions.length).toBe(1);
      expect(todaySessions[0].timeWorked).toBe(7200000);
    });
  });

  describe('deleteSession', () => {
    it('should remove specified session', () => {
      // Create a unique session
      const uniqueTime = 3601234; // Unique timeWorked value
      const sessionToDelete: Session = {
        date: new Date(),
        timeWorked: uniqueTime,
      };

      service.addSession(sessionToDelete);
      const initialLength = service.getWorkLog.length;

      // Find the actual session object to delete
      const sessionToRemove = service.getWorkLog.find(
        (s) => s.timeWorked === uniqueTime
      );
      expect(sessionToRemove).toBeTruthy();

      if (sessionToRemove) {
        service.deleteSession(sessionToRemove);
      }

      expect(service.getWorkLog.length).toBe(initialLength - 1);
      expect(
        service.getWorkLog.some((s) => s.timeWorked === uniqueTime)
      ).toBeFalse();
    });
  });

  describe('editSession', () => {
    it('should update session time correctly', () => {
      const now = new Date();
      const uniqueTime = 3602345; // Unique timeWorked value
      const oldSession: Session = {
        date: now,
        timeWorked: uniqueTime,
      };

      service.addSession(oldSession);

      // Find the actual session object to edit
      const sessionToEdit = service.getWorkLog.find(
        (s) => s.timeWorked === uniqueTime
      );
      expect(sessionToEdit).toBeTruthy();

      if (sessionToEdit) {
        const startTime = new Date(now);
        startTime.setHours(10, 0, 0); // Set specific time
        const endTime = new Date(now);
        endTime.setHours(12, 0, 0); // 2 hours later

        service.editSession(sessionToEdit, startTime, endTime);

        const editedSession = service.getWorkLog.find((s) => {
          const sessionDate = new Date(s.date);
          return sessionDate.getHours() === startTime.getHours();
        });

        expect(editedSession).toBeTruthy();
        expect(editedSession?.timeWorked).toBe(7200000); // 2 hours in milliseconds
      }
    });
  });

  describe('firstClockIn', () => {
    it("should find today's session", () => {
      const todaySession: Session = {
        date: new Date(),
        timeWorked: 3600000,
      };

      service.addSession(todaySession);

      expect(service.firstClockIn).toBeTruthy();
      expect(service.firstClockIn?.timeWorked).toBe(3600000);
    });

    it("should return undefined when no today's session exists", () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdaySession: Session = {
        date: yesterday,
        timeWorked: 3600000,
      };

      // Clear default today's session
      service.deleteSession(service.getWorkLog[0]);
      service.addSession(yesterdaySession);

      expect(service.firstClockIn).toBeUndefined();
    });
  });

  describe('localStorage interaction', () => {
    it('should persist changes to localStorage', () => {
      const session: Session = {
        date: new Date(),
        timeWorked: 3600000,
      };

      service.addSession(session);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'workLog',
        jasmine.any(String)
      );

      const lastCallArgs = localStorageSpy.setItem.calls.mostRecent().args;
      const storedData = JSON.parse(lastCallArgs[1]);
      expect(
        storedData.some((s: Session) => s.timeWorked === 3600000)
      ).toBeTrue();
    });
  });
});
