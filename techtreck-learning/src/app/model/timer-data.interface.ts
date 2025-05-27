export interface TimerData {
  id: number;
  startTime: Date;
  endTime: Date;
  requiredTime: number;
  timerType: 'ON' | 'OFF';
}
