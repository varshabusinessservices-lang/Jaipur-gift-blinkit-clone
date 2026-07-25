import { DashboardFilter } from '../types/dashboard.types';

export function getFilterLabel(filter: DashboardFilter): string {
  switch (filter.range) {
    case 'today':
      return 'Today';
    case '3d':
      return 'Last 3 Days';
    case '7d':
      return 'Last 7 Days';
    case '15d':
      return 'Last 15 Days';
    case '30d':
      return 'Last 30 Days';
    case 'custom':
      if (filter.from && filter.to) {
        return `${filter.from} to ${filter.to}`;
      }
      return 'Custom Range';
    default:
      return 'Today';
  }
}

export function getCurrentKolkataDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date()); // YYYY-MM-DD
}
