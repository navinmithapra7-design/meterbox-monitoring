import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useSupabase } from '../context/SupabaseDataContext';
import { buildChartData, getReadingLevel, getLevelStyles, timeAgo, THRESHOLDS } from '../lib/dataUtils';

export default function LiveMonitoring() {
  const { readings, isLoading } = useSupabase();
  const [timeRange, setTimeRange] = useState('1h');

  const chartData = useMemo(() => buildChartData(readings, timeRange), [readings, timeRange]);
  const latest = readings[0];
  const level = getReadingLevel(latest);
  const styles = getLevelStyles(level);

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-primary tracking-tight">Live Monitoring</h2>
        <div className="h-[400px] bg-surface border border-outline-variant rounded-xl animate-pulse"></div>
      </div>
    );
  }

  // Compute gauge percentages
  const tempPct = latest ? Math.min((latest.temperature / 100) * 100, 100) : 0;
  const smokePct = latest ? Math.min((latest.smoke / 1200) * 100, 100) : 0;

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Live Monitoring</h2>
          <p className="text-base text-on-surface-variant mt-1">Real-time sensor data visualization</p>
        </div>
        <div className="flex items-center gap-2 mt-3 sm:mt-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wider">Streaming Live</span>
        </div>
      </div>

      {/* Gauge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Temperature Gauge */}
        <div className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 text-center transition-all duration-500`}>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Temperature</span>
          <div className={`text-5xl font-black mt-3 mb-2 ${latest && latest.temperature >= 60 ? 'text-red-600' : 'text-primary'}`}>
            {latest ? latest.temperature : '--'}
            <span className="text-lg font-medium text-on-surface-variant">°C</span>
          </div>
          {/* Gauge bar */}
          <div className="w-full h-3 bg-surface-container-high rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ease-out ${
              tempPct >= 80 ? 'bg-red-500' : tempPct >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
            }`} style={{ width: `${tempPct}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
            <span>0°C</span>
            <span className="text-amber-600 font-semibold">{THRESHOLDS.temperature.warning}°C</span>
            <span className="text-red-600 font-semibold">{THRESHOLDS.temperature.danger}°C</span>
            <span>100°C</span>
          </div>
        </div>

        {/* Smoke Gauge */}
        <div className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 text-center transition-all duration-500`}>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Smoke Level</span>
          <div className={`text-5xl font-black mt-3 mb-2 ${latest && latest.smoke >= 850 ? 'text-red-600' : 'text-primary'}`}>
            {latest ? latest.smoke : '--'}
          </div>
          <div className="w-full h-3 bg-surface-container-high rounded-full mt-3 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ease-out ${
              smokePct >= 83 ? 'bg-red-500' : smokePct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
            }`} style={{ width: `${smokePct}%` }}></div>
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1">
            <span>0</span>
            <span className="text-amber-600 font-semibold">{THRESHOLDS.smoke.warning}</span>
            <span className="text-red-600 font-semibold">{THRESHOLDS.smoke.danger}</span>
            <span>1200</span>
          </div>
        </div>

        {/* System Status Card */}
        <div className={`${styles.bg} ${styles.border} border-2 rounded-2xl p-6 text-center transition-all duration-500`}>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">System Status</span>
          <div className="flex items-center justify-center mt-4">
            <span className={`material-symbols-outlined text-5xl ${styles.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {level === 'danger' ? 'crisis_alert' : level === 'warning' ? 'warning' : 'verified_user'}
            </span>
          </div>
          <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${styles.badge}`}>
            {level === 'danger' ? '🔴 DANGER' : level === 'warning' ? '🟡 WARNING' : '🟢 NORMAL'}
          </span>
          <p className="text-xs text-on-surface-variant mt-2">
            {latest ? `Location: ${latest.location}` : 'No data'}
          </p>
          <p className="text-[10px] text-on-surface-variant">
            {latest ? timeAgo(latest.created_at) : ''}
          </p>
        </div>
      </div>

      {/* Time Range Selector + Charts */}
      <div className="bg-surface border border-outline-variant rounded-xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h3 className="text-lg font-semibold text-primary">Historical Trends</h3>
          <div className="flex gap-1 bg-surface-container-low rounded-lg p-1">
            {[
              { value: '1h', label: '1H' },
              { value: '6h', label: '6H' },
              { value: '24h', label: '24H' },
              { value: '7d', label: '7D' },
              { value: '30d', label: '30D' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setTimeRange(opt.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  timeRange === opt.value
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        
        {chartData.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temperature Chart */}
            <div className="h-[300px] bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <h4 className="text-sm font-semibold text-primary mb-2 text-center">Temperature (°C)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#858383' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#858383' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1b1b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTime || label}
                  />
                  <Area type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#ef4444" strokeWidth={2} fill="url(#tempGradient)" activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Smoke Chart */}
            <div className="h-[300px] bg-surface-container-lowest border border-outline-variant rounded-xl p-4">
              <h4 className="text-sm font-semibold text-primary mb-2 text-center">Smoke Level</h4>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="smokeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#858383' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#858383' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1b1b', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullTime || label}
                  />
                  <Area type="monotone" dataKey="smoke" name="Smoke" stroke="#f59e0b" strokeWidth={2} fill="url(#smokeGradient)" activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-on-surface-variant">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">show_chart</span>
              <p className="text-sm">No data available for this time range</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Readings Log */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Reading Log</h3>
          <span className="text-xs text-on-surface-variant">Last {Math.min(readings.length, 50)} readings</span>
        </div>
        <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
          <table className="w-full text-left min-w-[600px]">
            <thead className="sticky top-0 bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Time</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Location</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Temp</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Smoke</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {readings.slice(0, 50).map(r => {
                const rl = getReadingLevel(r);
                const rs = getLevelStyles(rl);
                return (
                  <tr key={r.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="p-3 px-6 text-sm text-on-surface whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-3 px-6 text-sm text-on-surface-variant">{r.location || '—'}</td>
                    <td className={`p-3 px-6 text-sm font-semibold ${r.temperature >= 60 ? 'text-red-600' : 'text-primary'}`}>{r.temperature}°C</td>
                    <td className={`p-3 px-6 text-sm font-semibold ${r.smoke >= 850 ? 'text-red-600' : 'text-primary'}`}>{r.smoke}</td>
                    <td className="p-3 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${rs.badge}`}>{rl}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {readings.length === 0 && (
            <div className="py-8 text-center text-sm text-on-surface-variant">No readings yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
