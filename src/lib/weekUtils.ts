export interface WeekOption {
  label: string;
  weekStartDate: string;
  weekEndDate: string;
}

export function getWeekStartDate(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekEndDate(weekStart: Date): Date {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function formatWeekLabel(weekStart: Date): string {
  const weekEnd = getWeekEndDate(weekStart);

  const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
  const startDay = weekStart.getDate();
  const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
}

export function getWeekOptions(numWeeks: number = 4): WeekOption[] {
  const options: WeekOption[] = [];
  const today = new Date();

  for (let i = 0; i < numWeeks; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - (i * 7));

    const weekStart = getWeekStartDate(date);
    const weekEnd = getWeekEndDate(weekStart);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    let label: string;
    if (i === 0) {
      label = `Current Week (${formatWeekLabel(weekStart)})`;
    } else if (i === 1) {
      label = `Last Week (${formatWeekLabel(weekStart)})`;
    } else {
      label = `${i + 1} Weeks Ago (${formatWeekLabel(weekStart)})`;
    }

    options.push({
      label,
      weekStartDate: weekStartStr,
      weekEndDate: weekEndStr,
    });
  }

  return options;
}

export function formatDateToWeekStart(dateString: string): string {
  const date = new Date(dateString);
  const weekStart = getWeekStartDate(date);
  return weekStart.toISOString().split('T')[0];
}
