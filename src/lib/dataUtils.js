// ── Thresholds matching ESP32 firmware ─────────────────────────
export const THRESHOLDS = {
  temperature: { normal: 45, warning: 60, danger: 80, unit: '°C' },
  smoke: { normal: 500, warning: 850, danger: 1000, unit: 'raw' },
};

/**
 * Get status level from a reading: 'danger' | 'warning' | 'normal'
 */
export function getReadingLevel(reading) {
  if (!reading) return 'normal';
  const t = reading.temperature ?? 0;
  const s = reading.smoke ?? 0;

  if (t >= THRESHOLDS.temperature.danger || s >= THRESHOLDS.smoke.danger) return 'danger';
  if (t >= THRESHOLDS.temperature.warning || s >= THRESHOLDS.smoke.warning) return 'warning';
  return 'normal';
}

/**
 * CSS classes for each status level
 */
export function getLevelStyles(level) {
  switch (level) {
    case 'danger':
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        text: 'text-red-700',
        badge: 'bg-red-600 text-white',
        dot: 'bg-red-500',
        glow: 'shadow-red-200',
        icon: 'text-red-500',
      };
    case 'warning':
      return {
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        text: 'text-amber-700',
        badge: 'bg-amber-500 text-white',
        dot: 'bg-amber-500',
        glow: 'shadow-amber-200',
        icon: 'text-amber-500',
      };
    default:
      return {
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        badge: 'bg-emerald-600 text-white',
        dot: 'bg-emerald-500',
        glow: 'shadow-emerald-200',
        icon: 'text-emerald-500',
      };
  }
}

/**
 * Compute dashboard stats from readings array.
 */
export function computeStats(readings = [], devices = [], alerts = []) {
  const total = readings.length;
  const latest = readings[0] || null;

  const temps = readings.filter(r => r.temperature != null).map(r => r.temperature);
  const avgTemp = temps.length > 0 ? Math.round(temps.reduce((a, b) => a + b, 0) / temps.length * 10) / 10 : 0;
  const maxTemp = temps.length > 0 ? Math.max(...temps) : 0;
  const minTemp = temps.length > 0 ? Math.min(...temps) : 0;

  const smokes = readings.filter(r => r.smoke != null).map(r => r.smoke);
  const avgSmoke = smokes.length > 0 ? Math.round(smokes.reduce((a, b) => a + b, 0) / smokes.length) : 0;
  const maxSmoke = smokes.length > 0 ? Math.max(...smokes) : 0;

  const alertReadings = readings.filter(r => r.status === 'ALERT');
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);

  // Group by location for device count
  const locations = new Set(readings.map(r => r.location).filter(Boolean));

  return {
    totalReadings: total,
    totalDevices: devices.length || locations.size,
    avgTemp,
    maxTemp,
    minTemp,
    avgSmoke,
    maxSmoke,
    alertCount: alertReadings.length,
    unresolvedAlerts: unresolvedAlerts.length,
    latestReading: latest,
  };
}

/**
 * Build trend chart data from readings.
 */
export function buildChartData(readings = [], range = '1h') {
  if (readings.length === 0) return [];

  const now = new Date();
  let cutoffMs;
  switch (range) {
    case '1h': cutoffMs = 60 * 60 * 1000; break;
    case '6h': cutoffMs = 6 * 60 * 60 * 1000; break;
    case '24h': cutoffMs = 24 * 60 * 60 * 1000; break;
    case '7d': cutoffMs = 7 * 24 * 60 * 60 * 1000; break;
    case '30d': cutoffMs = 30 * 24 * 60 * 60 * 1000; break;
    default: cutoffMs = 60 * 60 * 1000;
  }

  const cutoff = new Date(now.getTime() - cutoffMs);
  const filtered = readings
    .filter(r => new Date(r.created_at) >= cutoff)
    .reverse(); // oldest first for chart

  return filtered.map(r => ({
    time: new Date(r.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    fullTime: new Date(r.created_at).toLocaleString(),
    temperature: r.temperature ?? 0,
    smoke: r.smoke ?? 0,
    status: r.status,
  }));
}

/**
 * Build alert message from a reading.
 */
export function buildAlertMessage(reading) {
  const issues = [];
  const t = reading.temperature ?? 0;
  const s = reading.smoke ?? 0;

  if (t >= THRESHOLDS.temperature.danger) issues.push(`CRITICAL: Temperature ${t}°C exceeds danger threshold`);
  else if (t >= THRESHOLDS.temperature.warning) issues.push(`WARNING: Temperature ${t}°C above safe limit`);

  if (s >= THRESHOLDS.smoke.danger) issues.push(`CRITICAL: Smoke level ${s} — immediate action required`);
  else if (s >= THRESHOLDS.smoke.warning) issues.push(`WARNING: Smoke level ${s} elevated`);

  return issues.join('. ') || `Alert at ${reading.location}: Temp ${t}°C, Smoke ${s}`;
}

/**
 * Format a timestamp to relative string.
 */
export function timeAgo(dateStr) {
  const ts = new Date(dateStr);
  const now = new Date();
  const diffMs = now - ts;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffSec < 10) return 'Just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return ts.toLocaleDateString();
}

/**
 * Generate CSV content from readings array.
 */
export function readingsToCSV(readings) {
  if (readings.length === 0) return '';
  const headers = ['ID', 'Timestamp', 'Temperature (°C)', 'Smoke', 'Status', 'Location'];
  const rows = readings.map(r => [
    r.id,
    new Date(r.created_at).toISOString(),
    r.temperature,
    r.smoke,
    r.status,
    r.location || '',
  ]);
  return [headers, ...rows].map(row => row.join(',')).join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 */
export function downloadCSV(csvContent, filename = 'report.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
