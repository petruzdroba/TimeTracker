export interface LeaveSlip {
  date: Date;
  startTime: Date;
  endTime: Date;
  description: string;
  status: 'pending' | 'accepted' | 'denied';
}
