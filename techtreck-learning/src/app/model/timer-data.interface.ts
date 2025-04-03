export interface TimerData {
  startTime: Date;
  endTime: Date;
  requiredTime: number;
  timerType: 'ON' | 'OFF';
}
