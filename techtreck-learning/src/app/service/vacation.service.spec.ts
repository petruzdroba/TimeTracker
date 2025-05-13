import { TestBed } from '@angular/core/testing';
import { VacationService } from './vacation.service';
import { Vacation } from '../model/vacation.interface';
import { VacationData } from '../model/vacation-data.interface';

describe('VacationService', () => {
  let service: VacationService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);
    Object.defineProperty(window, 'localStorage', { value: spy });
    localStorageSpy = window.localStorage as jasmine.SpyObj<Storage>;

    TestBed.configureTestingModule({
      providers: [VacationService],
    });
    service = TestBed.inject(VacationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize with default values when no localStorage data exists', () => {
      localStorageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(VacationService);

      expect(service.remainingDays).toBe(14);
      expect(service.futureVacations).toEqual([]);
      expect(service.pastVacations).toEqual([]);
    });
  });

  describe('updateVacationData', () => {
    it('should store vacation data in localStorage', () => {
      const expectedData: VacationData = {
        futureVacations: [],
        pastVacations: [],
        remainingVacationDays: 14,
      };

      service.updateVacationData();

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'vacationData',
        JSON.stringify(expectedData)
      );
    });

    it('should store updated vacation data after modifications', () => {
      const mockVacation: Vacation = {
        startDate: new Date(),
        endDate: new Date(),
        description: 'Test vacation',
        status: 'pending',
      };

      service.addVacation(mockVacation);

      const expectedData = {
        futureVacations: [mockVacation],
        pastVacations: [],
        remainingVacationDays: 14,
      };

      expect(localStorageSpy.setItem).toHaveBeenCalledWith(
        'vacationData',
        jasmine.any(String)
      );

      const lastCallArgs = localStorageSpy.setItem.calls.mostRecent().args;
      const storedData = JSON.parse(lastCallArgs[1]);

      expect(storedData.futureVacations.length).toBe(1);
      expect(storedData.remainingVacationDays).toBe(
        expectedData.remainingVacationDays
      );
    });

    it('should maintain data consistency across multiple updates', () => {
      const initialData: VacationData = {
        futureVacations: [],
        pastVacations: [],
        remainingVacationDays: 14,
      };

      service.updateVacationData();
      let firstCall = localStorageSpy.setItem.calls.first().args[1];
      expect(JSON.parse(firstCall)).toEqual(initialData);

      // Modify data
      const mockVacation: Vacation = {
        startDate: new Date(),
        endDate: new Date(),
        description: 'Test',
        status: 'pending',
      };

      service.addVacation(mockVacation);

      let lastCall = localStorageSpy.setItem.calls.mostRecent().args[1];
      let finalData = JSON.parse(lastCall);
      expect(finalData.futureVacations.length).toBe(1);
      expect(localStorageSpy.setItem).toHaveBeenCalledTimes(2);
    });
  });
});
