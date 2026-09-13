/** ISO day string (YYYY-MM-DD), the convention used to key/compare workout dates. */
export function isoDay(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function today(): string {
  return isoDay();
}

export function yesterday(): string {
  return isoDay(new Date(Date.now() - 86400000));
}
