import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { AdminComponent } from './admin.component';
import { AdminService } from '../../service/admin.service';
import { ManagerService } from '../../service/manager.service';
import { UserData } from '../../model/user-data.interface';
import { of } from 'rxjs';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;
  let adminServiceSpy: jasmine.SpyObj<AdminService>;
  let managerServiceSpy: jasmine.SpyObj<ManagerService>;

  const mockUsers: UserData[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'employee',
      workHours: 8,
      personalTime: 60,
      vacationDays: 10,
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'manager',
      workHours: 7,
      personalTime: 50,
      vacationDays: 8,
    },
  ];

  beforeEach(async () => {
    adminServiceSpy = jasmine.createSpyObj('AdminService', [
      'initialize',
      'getAdminData',
      'restoreVacation',
      'restoreLeaveTime',
    ]);
    managerServiceSpy = jasmine.createSpyObj('ManagerService', [
      'getRemainingDays',
      'getRemainingTime',
    ]);

    adminServiceSpy.initialize.and.returnValue(Promise.resolve());
    adminServiceSpy.getAdminData.and.returnValue(mockUsers);

    managerServiceSpy.getRemainingDays.and.callFake((userId: number) => {
      return userId === 1 ? 5 : 3;
    });
    managerServiceSpy.getRemainingTime.and.callFake((userId: number) => {
      return userId === 1 ? 3600000 : 1800000; // ms, example
    });

    await TestBed.configureTestingModule({
      imports: [AdminComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceSpy },
        { provide: ManagerService, useValue: managerServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and filter out admin users', fakeAsync(() => {
    // Modify mockUsers to add admin user
    const usersWithAdmin = [
      ...mockUsers,
      {
        id: 3,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        workHours: 9,
        personalTime: 40,
        vacationDays: 12,
      },
    ];
    adminServiceSpy.getAdminData.and.returnValue(usersWithAdmin);

    (component as any).ngOnInit();
    tick();

    // filteredUsers should not include admins
    const filtered = (component as any).filteredUsers();
    expect(filtered.some((u: UserData) => u.role === 'admin')).toBeFalse();
    expect(filtered.length).toBe(usersWithAdmin.length - 1);
  }));

  it('should filter users by searchText', () => {
    (component as any).adminData = mockUsers;
    (component as any).searchText = 'jane';
    (component as any).filterUsers();
    expect((component as any).filteredUsers().length).toBe(1);
    expect((component as any).filteredUsers()[0].email).toBe(
      'jane@example.com'
    );

    (component as any).searchText = 'nonexistent';
    (component as any).filterUsers();
    expect((component as any).filteredUsers().length).toBe(0);

    (component as any).searchText = '';
    (component as any).filterUsers();
    expect((component as any).filteredUsers().length).toBe(mockUsers.length);
  });

  it('should open edit window with selected user', () => {
    const user = mockUsers[0];
    (component as any).openEditWindow(user);
    expect((component as any).isOpenEdit).toBeTrue();
    expect((component as any).selectedUser).toEqual(user);
  });

  it('should get benefits correctly', () => {
    expect((component as any).getBenefits(1)).toEqual({
      vacations: 5,
      leave: 10, // 3600000 / 360000
    });
    expect((component as any).getBenefits(2)).toEqual({
      vacations: 3,
      leave: 5, // 1800000 / 360000
    });
  });

  it('should calculate used leave hours', () => {
    const userWithPersonalTime = mockUsers[0]; // personalTime = 60
    expect((component as any).getUsedLeaveHours(userWithPersonalTime)).toBe(
      60 - 10
    );

    const userWithoutPersonalTime = { ...mockUsers[0], personalTime: 0 };
    expect((component as any).getUsedLeaveHours(userWithoutPersonalTime)).toBe(
      0
    );
  });

  it('should restore vacation and refresh data', async () => {
    adminServiceSpy.restoreVacation.and.returnValue(Promise.resolve());
    adminServiceSpy.initialize.and.returnValue(Promise.resolve());
    adminServiceSpy.getAdminData.and.returnValue(mockUsers);

    (component as any).isOpenEdit = true;
    (component as any).selectedUser = mockUsers[0];

    await (component as any).restoreVacation(mockUsers[0].id);

    expect(adminServiceSpy.restoreVacation).toHaveBeenCalledWith(
      mockUsers[0].id
    );
    expect(adminServiceSpy.initialize).toHaveBeenCalled();
    expect((component as any).isOpenEdit).toBeFalse();
    expect((component as any).selectedUser).toBeNull();
  });

  it('should restore leave time and refresh data', async () => {
    adminServiceSpy.restoreLeaveTime.and.returnValue(Promise.resolve());
    adminServiceSpy.initialize.and.returnValue(Promise.resolve());
    adminServiceSpy.getAdminData.and.returnValue(mockUsers);

    (component as any).isOpenEdit = true;
    (component as any).selectedUser = mockUsers[1];

    await (component as any).restoreLeaveTime(mockUsers[1].id);

    expect(adminServiceSpy.restoreLeaveTime).toHaveBeenCalledWith(
      mockUsers[1].id
    );
    expect(adminServiceSpy.initialize).toHaveBeenCalled();
    expect((component as any).isOpenEdit).toBeFalse();
    expect((component as any).selectedUser).toBeNull();
  });

  it('should close edit window and refresh data', async () => {
    adminServiceSpy.initialize.and.returnValue(Promise.resolve());
    adminServiceSpy.getAdminData.and.returnValue(mockUsers);

    (component as any).isOpenEdit = true;
    (component as any).selectedUser = mockUsers[1];

    await (component as any).closeEditWindow();

    expect(adminServiceSpy.initialize).toHaveBeenCalled();
    expect((component as any).isOpenEdit).toBeFalse();
    expect((component as any).selectedUser).toBeNull();
  });
});
