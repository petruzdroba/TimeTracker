export interface Vacation {
  id?:number,
  userId?:number,
  startDate: Date;
  endDate: Date;
  description: string;
  status: 'pending' | 'accepted' | 'denied' | 'ignored';
}
