export function transformTimeStringToDate(timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, seconds, 0);
  return now;
}

export function validateTimeRangeString(
  startTime: string,
  endTime: string,
  remainingTime: number
): boolean {
  const dateA = transformTimeStringToDate(startTime + ':00');
  const dateB = transformTimeStringToDate(endTime + ':00');

  return (
    dateB.getTime() - dateA.getTime() <= remainingTime &&
    dateB.getTime() - dateA.getTime() > 0
  );
}

export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
  let currentDate = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;

  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
}

export function transformDateToTimeString(date: Date): string {
  const dateA = new Date(date);
  const hours = dateA.getHours().toString().padStart(2, '0');
  const minutes = dateA.getMinutes().toString().padStart(2, '0');
  const seconds = dateA.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function validateDateRange(
  startDate: Date,
  endDate: Date,
  maxDays: number
): boolean {
  let currentDate = new Date(startDate);
  let count = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDate();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Exclude Sundays (0) and Saturdays (6)
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count <= maxDays;
} //function validates the number of vacation days taken and if they have enough remaining
