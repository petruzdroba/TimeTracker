import { TestBed } from '@angular/core/testing';
import { TimerService } from './timer.service';

describe('TimerService', () => {
  let service: TimerService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);
    Object.defineProperty(window, 'localStorage', { value: spy });
    localStorageSpy = window.localStorage as jasmine.SpyObj<Storage>;

    TestBed.configureTestingModule({
      providers: [TimerService],
    });
    service = TestBed.inject(TimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize with default values when no localStorage data exists', () => {
      localStorageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(TimerService);

      expect(service.timerType).toBe('OFF');
      expect(service.requiredTime).toBe(7200000);
    });

    it('should load data from localStorage with current date', () => {
      // Create fixed dates to avoid timing issues
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockData = {
        startTime: today.toISOString(),
        endTime: today.toISOString(),
        remainingTime: 7200000,
        timerType: 'ON',
      };

      // Reset the service and spies before the test
      localStorageSpy.getItem.and.returnValue(JSON.stringify(mockData));
      TestBed.resetTestingModule();
      service = TestBed.inject(TimerService);

      // Verify the service loaded the mock data correctly
      expect(service.timerType).toBe('ON');
      expect(localStorageSpy.getItem).toHaveBeenCalledWith('timerData');
    });

    it('should load data from localStorage if same day', () => {
      // Setup clock before any date operations
      jasmine.clock().install();

      // Set a fixed reference time
      const fixedDate = new Date('2024-05-05T10:00:00');
      jasmine.clock().mockDate(fixedDate);

      // Create mock data with exact same timestamp
      const mockData = {
        startTime: fixedDate.toISOString(),
        endTime: fixedDate.toISOString(),
        remainingTime: 7200000,
        timerType: 'OFF',
      };

      // Setup localStorage before service initialization
      localStorageSpy.getItem.and.returnValue(JSON.stringify(mockData));

      // Reset and create service
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [TimerService],
      });
      service = TestBed.inject(TimerService);

      // Verify timer state
      expect(service.requiredTime).toBe(7200000);
      expect(service.timerType).toBe('OFF');

      // Cleanup
      jasmine.clock().uninstall();
    });
  });

  describe('updateTimerData', () => {
    it('should update timer data and localStorage', () => {
      const newData = {
        startTime: new Date(),
        endTime: new Date(),
        requiredTime: 7200000,
        timerType: 'ON' as const,
      };

      service.updateTimerData(newData);

      expect(service.timer).toEqual(newData);
      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day dates', () => {
      const date1 = new Date('2024-05-05T10:00:00');
      const date2 = new Date('2024-05-05T15:30:00');

      const result = (service as any).isSameDay(date1, date2);

      expect(result).toBe(true);
    });

    it('should return false for different day dates', () => {
      const date1 = new Date('2024-05-05T10:00:00');
      const date2 = new Date('2024-05-06T10:00:00');

      const result = (service as any).isSameDay(date1, date2);

      expect(result).toBe(false);
    });
  });

  describe('Getters', () => {
    it('should return correct values', () => {
      const testData = {
        startTime: new Date(),
        endTime: new Date(),
        requiredTime: 7200000,
        timerType: 'ON' as const,
      };

      service.updateTimerData(testData);

      expect(service.startTime).toEqual(testData.startTime);
      expect(service.endTime).toEqual(testData.endTime);
      expect(service.requiredTime).toBe(testData.requiredTime);
      expect(service.timerType).toBe(testData.timerType);
      expect(service.timer).toEqual(testData);
    });
  });
});
