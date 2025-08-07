export function formatDate(date: string): string {
  // 输入格式 '20250807'，输出 '2025-08-07'
  if (date.length !== 8) return date;
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}
