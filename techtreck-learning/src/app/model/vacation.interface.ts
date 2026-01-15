export interface Vacation {
  id?:number,
  startDate: Date;
  endDate: Date;
  description: string;
  status: 'pending' | 'accepted' | 'denied' | 'ignored';
}
