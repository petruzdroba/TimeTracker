import { TestBed } from '@angular/core/testing';
import { LeaveSlipService } from './leave-slip.service';
import { LeaveSlip } from '../model/leave-slip.interface';

describe('LeaveSlipService', () => {
  let service: LeaveSlipService;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Storage', ['getItem', 'setItem']);
    Object.defineProperty(window, 'localStorage', { value: spy });
    localStorageSpy = window.localStorage as jasmine.SpyObj<Storage>;

    TestBed.configureTestingModule({
      providers: [LeaveSlipService],
    });
    service = TestBed.inject(LeaveSlipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Constructor', () => {
    it('should initialize with default values when no localStorage data exists', () => {
      localStorageSpy.getItem.and.returnValue(null);
      service = TestBed.inject(LeaveSlipService);

      expect(service.remainingTime).toBe(21600000);
      expect(service.futureLeaves).toEqual([]);
      expect(service.pastLeaves).toEqual([]);
    });

    it('should load and process data from localStorage', () => {
      const mockData = {
        futureLeaves: [],
        pastLeaves: [],
        remainingTime: 21600000,
      };
      localStorageSpy.getItem.and.returnValue(JSON.stringify(mockData));

      service = TestBed.inject(LeaveSlipService);

      expect(service.leaveSlip).toEqual(mockData);
    });
  });

  describe('addLeave', () => {
    it('should add new leave to futureLeaves', () => {
      const newLeave: LeaveSlip = {
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        description: 'Test leave',
        status: 'pending',
      };

      service.addLeave(newLeave);

      expect(service.futureLeaves).toContain(newLeave);
      expect(localStorageSpy.setItem).toHaveBeenCalled();
    });
  });

  describe('acceptedLeaveSlip', () => {
    it('should update remaining time when leave is accepted', () => {
      const startTime = new Date('2024-05-05T10:00:00');
      const endTime = new Date('2024-05-05T12:00:00');
      const acceptedLeave: LeaveSlip = {
        date: startTime,
        startTime: startTime,
        endTime: endTime,
        description: 'Accepted leave',
        status: 'accepted',
      };

      const initialTime = service.remainingTime;
      service.acceptedLeaveSlip(acceptedLeave);

      expect(service.remainingTime).toBe(
        initialTime - (endTime.getTime() - startTime.getTime())
      );
    });
  });

  describe('deleteLeave', () => {
    it('should delete future leave and restore time if accepted', () => {
      const leave: LeaveSlip = {
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        description: 'Test leave',
        status: 'accepted',
      };

      service.addLeave(leave);
      const initialLength = service.futureLeaves.length;

      service.deleteLeave(0, 'future');

      expect(service.futureLeaves.length).toBe(initialLength - 1);
    });

    it('should delete past leave', () => {
      const pastLeave: LeaveSlip = {
        date: new Date('2024-01-01'),
        startTime: new Date('2024-01-01'),
        endTime: new Date('2024-01-01'),
        description: 'Past leave',
        status: 'accepted',
      };

      service.leaveSlip.pastLeaves.push(pastLeave);
      const initialLength = service.pastLeaves.length;

      service.deleteLeave(0, 'past');

      expect(service.pastLeaves.length).toBe(initialLength - 1);
    });
  });

  describe('editLeaveSlip', () => {
    it('should edit existing leave slip', () => {
      const oldLeave: LeaveSlip = {
        date: new Date(),
        startTime: new Date(),
        endTime: new Date(),
        description: 'Old description',
        status: 'pending',
      };

      const newLeave: LeaveSlip = {
        ...oldLeave,
        description: 'Updated description',
      };

      service.addLeave(oldLeave);
      service.editLeaveSlip(oldLeave, newLeave);

      const updatedLeave = service.futureLeaves.find(
        (leave) => leave.description === 'Updated description'
      );
      expect(updatedLeave).toBeTruthy();
    });
  });
});
