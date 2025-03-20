import { Injectable } from '@angular/core';
import { LeaveSlip } from '../model/leave-slip.interface';

@Injectable({ providedIn: 'root' })
export class LeaveSlipService {
  private _remainingTime: number = 21600000;
  private _pastLeaves: LeaveSlip[] = [];
  private _futureLeaves: LeaveSlip[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const storedLeaveDataString = window.localStorage.getItem('leaveData');

      if (storedLeaveDataString) {
        const storedLeaveDataObject = JSON.parse(storedLeaveDataString);

        if (storedLeaveDataObject.remainingTime) {
          this._remainingTime = storedLeaveDataObject.remainingTime;
        } else {
          this._remainingTime = 0;
        }

        if (storedLeaveDataObject.futureLeaves) {
          this._futureLeaves = storedLeaveDataObject.futureLeaves;
        } else {
          this._futureLeaves = [];
        }

        if (storedLeaveDataObject.pastLeaves) {
          this._pastLeaves = storedLeaveDataObject.pastLeaves;
          const today = new Date();

          this._futureLeaves = this._futureLeaves.filter((leave) => {
            if (new Date(leave.date) < today) {
              if (leave.status === 'pending') {
                leave.status = 'ignored';
              }
              this._pastLeaves.push(leave); //removes the ones that are past their due time and not accepted, pending or denied
              return false; // Remove
            }
            return true; // Keep
          });
          this.updateLeaveData();
        } else {
          this._pastLeaves = [];
        }
      }
    }
  }

  public get remainingTime(): number {
    return this._remainingTime;
  }

  public get pastLeaves(): LeaveSlip[] {
    return this._pastLeaves;
  }

  public get futureLeaves(): LeaveSlip[] {
    return this._futureLeaves;
  }

  getLeaveIndex(leave: LeaveSlip): number {
    return this._futureLeaves.findIndex((leaves) => leaves === leave);
  }

  updateLeaveData() {
    window.localStorage.setItem(
      'leaveData',
      JSON.stringify({
        remainingTime: this.remainingTime,
        pastLeaves: this.pastLeaves,
        futureLeaves: this.futureLeaves,
      })
    );
  }

  addLeave(leaveData: LeaveSlip) {
    this.futureLeaves.push(leaveData);
    this.acceptedVacation(leaveData);
    this.updateLeaveData();
  }

  acceptedVacation(leaveData: LeaveSlip) {
    if (leaveData.status === 'accepted') {
      const dateA = new Date(leaveData.startTime);
      const dateB = new Date(leaveData.endTime);
      this._remainingTime -= dateB.getTime() - dateA.getTime();
    }
  }

  restoreLeaveTime(index: number) {
    if (this._futureLeaves[index].status === 'accepted') {
      const dateA = new Date(this._futureLeaves[index].startTime);
      const dateB = new Date(this._futureLeaves[index].endTime);

      this._remainingTime += dateB.getTime() - dateA.getTime();
    }
  }

  deleteLeave(index: number, tableType: 'future' | 'past') {
    if (tableType === 'future') {
      this.restoreLeaveTime(index);

      this._futureLeaves = [
        ...this._futureLeaves.slice(0, index),
        ...this._futureLeaves.slice(index + 1),
      ];
    } else {
      this._pastLeaves = [
        ...this._pastLeaves.slice(0, index),
        ...this._pastLeaves.slice(index + 1),
      ];
    }
    this.updateLeaveData();
  }

  resetData() {
    window.localStorage.setItem(
      'leaveData',
      JSON.stringify({
        remainingTime: 21600000,
        pastLeaves: [],
        futureLeaves: [],
      })
    );
    window.location.reload();
  }
}
