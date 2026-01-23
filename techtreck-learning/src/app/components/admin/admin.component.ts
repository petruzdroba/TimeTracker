import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../service/admin.service';
import { ManagerService } from '../../service/manager.service';
import { UserData } from '../../model/user-data.interface';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { EditUserComponent } from './edit-user/edit-user.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    EditUserComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private managerService = inject(ManagerService);

  searchText = signal('');
  isOpenEdit = false;
  selectedUser: UserData | null = null;

  private benefits = signal<Map<number, number>>(new Map());

  adminUsers = computed(() =>
    this.adminService
      .getAdminData()
      .filter((u) => u.role !== 'admin')
  );

  filteredUsers = computed(() => {
    const text = this.searchText().toLowerCase();
    const users = this.adminUsers();

    if (!text) return users;

    return users.filter((u) =>
      u.email.toLowerCase().includes(text)
    );
  });

  async ngOnInit(): Promise<void> {
    await this.adminService.initialize();
    await this.loadVacationUsage();
  }

  private async loadVacationUsage() {
    const map = new Map<number, number>();

    for (const user of this.adminUsers()) {
      const remaining = await this.managerService.getRemainingDays(user.id);
      const used = user.vacationDays - remaining;
      map.set(user.id, used);
    }

    this.benefits.set(map);
  }

  getUsedVacationDays(userId: number): number {
    return this.benefits().get(userId) ?? 0;
  }

  openEditWindow(user: UserData) {
    this.isOpenEdit = true;
    this.selectedUser = user;
  }

  async closeEditWindow() {
    this.isOpenEdit = false;
    this.selectedUser = null;

    await this.adminService.initialize();
    await this.loadVacationUsage();
  }
}
