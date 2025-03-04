export interface Vacation {
  startDate: Date;
  endDate: Date;
  description: string;
  status: 'pending' | 'accepted' | 'denied';
}
