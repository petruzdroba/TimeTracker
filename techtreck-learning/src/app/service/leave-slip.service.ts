import { computed, Injectable, signal } from '@angular/core';
import { LeaveSlip } from '../model/leave-slip.interface';
import { LeaveSlipData } from '../model/leaveslip-data.interface';

@Injectable({ providedIn: 'root' })
export class LeaveSlipService {
  private leaveSlipData = signal<LeaveSlipData>({
    futureLeaves: [],
    pastLeaves: [],
    remainingTime: 21600000, // 6 hours (21600000ms = 6h × 60m × 60s × 1000ms)
  });

  constructor() {
    if (typeof window !== 'undefined') {
      const storedData = window.localStorage.getItem('leaveData');
      if (storedData) {
        const data = JSON.parse(storedData);
        const processedData = this.processExpiredLeaves(data);
        this.leaveSlipData.set(processedData);
        this.updateLeaveData();
      }
    }
  }

  private processExpiredLeaves(data: LeaveSlipData): LeaveSlipData {
    const today = new Date();
    let futureLeaves = data.futureLeaves || [];
    let pastLeaves = data.pastLeaves || [];

    futureLeaves = futureLeaves.filter((leave) => {
      if (new Date(leave.date) < today) {
        if (leave.status === 'pending') {
          leave.status = 'ignored';
        }
        pastLeaves.push(leave);
        return false; // Remove from future
      }
      return true; // Keep in future
    });

    return {
      futureLeaves,
      pastLeaves,
      remainingTime: data.remainingTime,
    };
  }

  private readonly remainingTimeSignal = computed(
    () => this.leaveSlipData().remainingTime
  );
  private readonly pastLeavesSignal = computed(
    () => this.leaveSlipData().pastLeaves
  );
  private readonly futureLeavesSignal = computed(
    () => this.leaveSlipData().futureLeaves
  );

  private readonly _leaveSlipData = computed(() => this.leaveSlipData());

  get remainingTime(): number {
    return this.remainingTimeSignal();
  }

  get pastLeaves(): LeaveSlip[] {
    return this.pastLeavesSignal();
  }

  get futureLeaves(): LeaveSlip[] {
    return this.futureLeavesSignal();
  }

  get leaveSlip(): LeaveSlipData {
    return this._leaveSlipData();
  }

  getLeaveIndex(leave: LeaveSlip): number {
    return this.leaveSlipData().futureLeaves.findIndex(
      (leaves) => leave === leaves
    );
  }

  updateLeaveData() {
    window.localStorage.setItem(
      'leaveData',
      JSON.stringify(this.leaveSlipData())
    );
  }

  addLeave(leaveData: LeaveSlip) {
    this.leaveSlipData.update((currentData) => ({
      ...currentData,
      futureLeaves: [...currentData.futureLeaves, leaveData],
    }));
    this.acceptedLeaveSlip(leaveData);
    this.updateLeaveData();
  }

  acceptedLeaveSlip(leaveData: LeaveSlip) {
    if (leaveData.status === 'accepted') {
      const dateA = new Date(leaveData.startTime);
      const dateB = new Date(leaveData.endTime);
      this.leaveSlipData.update((currentData) => ({
        ...currentData,
        remainingTime:
          currentData.remainingTime - (dateB.getTime() - dateA.getTime()),
      }));
      this.updateLeaveData();
    }
  }

  restoreLeaveTime(index: number) {
    this.leaveSlipData.update((currentData) => {
      if (currentData.futureLeaves[index].status === 'accepted') {
        const dateA = new Date(currentData.futureLeaves[index].startTime);
        const dateB = new Date(currentData.futureLeaves[index].endTime);
        return {
          ...currentData,
          remainingTime:
            currentData.remainingTime + (dateB.getTime() - dateA.getTime()),
        };
      }
      return currentData;
    });
    this.updateLeaveData();
  }

  deleteLeave(index: number, tableType: 'future' | 'past') {
    this.leaveSlipData.update((currentData) => {
      if (tableType === 'future') {
        this.restoreLeaveTime(index);
        return {
          ...currentData,
          futureLeaves: [
            ...currentData.futureLeaves.slice(0, index),
            ...currentData.futureLeaves.slice(index + 1),
          ],
        };
      } else {
        return {
          ...currentData,
          pastLeaves: [
            ...currentData.pastLeaves.slice(0, index),
            ...currentData.pastLeaves.slice(index + 1),
          ],
        };
      }
    });
    this.updateLeaveData();
  }

  resetData() {
    this.leaveSlipData.set({
      remainingTime: 21600000,
      pastLeaves: [],
      futureLeaves: [],
    });
    this.updateLeaveData();
    window.location.reload();
  }

  editLeaveSlip(oldLeave: LeaveSlip, newLeaveData: LeaveSlip) {
    this.leaveSlipData.update((currentData) => {
      const index = currentData.futureLeaves.findIndex((leave) => {
        const dateA = new Date(oldLeave.date);
        const dateB = new Date(leave.date);
        return (
          dateA.getTime() === dateB.getTime() &&
          leave.description === oldLeave.description
        );
      });

      if (index !== -1) {
        this.restoreLeaveTime(index);
        const updatedLeaves = [...currentData.futureLeaves];
        updatedLeaves[index] = {
          ...newLeaveData,
          status: 'pending',
        };
        return {
          ...currentData,
          futureLeaves: updatedLeaves,
        };
      }
      return currentData;
    });
    this.updateLeaveData();
  }
}
