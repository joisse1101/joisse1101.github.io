export function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  // Create a copy of the start date to prevent mutating the original object
  const currentDate = new Date(startDate.getTime());
  const dates: Date[] = [];

  // Loop until the current date passes the end date
  while (currentDate <= endDate) {
    // Push a fresh copy of the current date into the array
    dates.push(new Date(currentDate));
    
    // Mutate the loop variable to move forward by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}

export function getLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}