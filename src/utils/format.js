const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const formatINR = (n) => `₹${inr.format(Math.round(n))}`;

export function formatDuration(totalMinutes) {
  const m = Math.max(1, Math.round(totalMinutes));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest}m`;
  return rest === 0 ? `${h}h` : `${h}h ${String(rest).padStart(2, '0')}m`;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function truncateMiddle(str, max = 34) {
  if (str.length <= max) return str;
  const keep = max - 1;
  const head = Math.ceil(keep * 0.6);
  return `${str.slice(0, head)}…${str.slice(str.length - (keep - head))}`;
}
