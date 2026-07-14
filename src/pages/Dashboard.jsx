import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseDataContext';
import { getReadingLevel, getLevelStyles, computeStats, timeAgo } from '../lib/dataUtils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { readings, devices, alerts, isLoading, error } = useSupabase();
  const stats = computeStats(readings, devices, alerts);
  const unresolvedAlerts = alerts.filter(a => !a.is_resolved);

  // Group latest reading per location
  const locationMap = {};
  readings.forEach(r => {
    if (!locationMap[r.location]) locationMap[r.location] = r;
  });
  const deviceCards = Object.values(locationMap);

  if (isLoading) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h3 className="text-4xl font-bold text-primary tracking-tight">Dashboard</h3>
          <p className="text-base text-on-surface-variant mt-2">Loading live data…</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-surface border border-outline-variant rounded-xl p-6 animate-pulse">
              <div className="h-3 bg-surface-container-high rounded w-2/3 mb-4"></div>
              <div className="h-8 bg-surface-container-high rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[1400px] mx-auto">
        <div className="bg-error-container text-on-error-container rounded-xl p-6 flex items-center space-x-3">
          <span className="material-symbols-outlined">error</span>
          <div>
            <h3 className="font-semibold">Connection Error</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const latestReading = readings[0];
  const latestLevel = getReadingLevel(latestReading);
  const latestStyles = getLevelStyles(latestLevel);

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div>
          <h3 className="text-4xl font-bold text-primary tracking-tight">Dashboard</h3>
          <p className="text-base text-on-surface-variant mt-1">
            Electricity Dept. — Smart Meter Safety Monitoring
          </p>
        </div>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <button onClick={() => navigate('/monitoring')} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-medium hover:bg-primary-container transition-colors flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">monitoring</span> Live Monitor
          </button>
        </div>
      </div>

      {/* Current Status Hero */}
      {latestReading && (
        <div className={`${latestStyles.bg} ${latestStyles.border} border-2 rounded-2xl p-6 shadow-lg ${latestStyles.glow} transition-all duration-500`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl ${latestLevel === 'danger' ? 'bg-red-100' : latestLevel === 'warning' ? 'bg-amber-100' : 'bg-emerald-100'} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-3xl ${latestStyles.icon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {latestLevel === 'danger' ? 'crisis_alert' : latestLevel === 'warning' ? 'warning' : 'verified_user'}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${latestStyles.badge}`}>
                    {latestLevel === 'danger' ? '🔴 DANGER' : latestLevel === 'warning' ? '🟡 WARNING' : '🟢 NORMAL'}
                  </span>
                  <span className="text-xs text-on-surface-variant">{timeAgo(latestReading.created_at)}</span>
                </div>
                <p className={`text-sm font-medium mt-1 ${latestStyles.text}`}>
                  {latestLevel === 'danger' ? 'Immediate attention required — readings exceed danger thresholds'
                    : latestLevel === 'warning' ? 'Elevated readings detected — monitoring closely'
                    : 'All readings within normal parameters'}
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider block">Temp</span>
                <span className={`text-3xl font-bold ${latestReading.temperature >= 60 ? 'text-red-600' : 'text-primary'}`}>
                  {latestReading.temperature}°C
                </span>
              </div>
              <div className="text-center">
                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider block">Smoke</span>
                <span className={`text-3xl font-bold ${latestReading.smoke >= 850 ? 'text-red-600' : 'text-primary'}`}>
                  {latestReading.smoke}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Total Devices</span>
          <div className="text-3xl font-bold text-primary mt-2">{stats.totalDevices}</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5 cursor-pointer hover:bg-surface-container-lowest transition-colors" onClick={() => navigate('/alerts')}>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Active Alerts</span>
          <div className={`text-3xl font-bold mt-2 ${stats.unresolvedAlerts > 0 ? 'text-red-600' : 'text-primary'}`}>{stats.unresolvedAlerts}</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Avg Temp</span>
          <div className="text-3xl font-bold text-primary mt-2">{stats.avgTemp}°C</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Max Temp</span>
          <div className={`text-3xl font-bold mt-2 ${stats.maxTemp >= 60 ? 'text-red-600' : 'text-primary'}`}>{stats.maxTemp}°C</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5">
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Total Readings</span>
          <div className="text-3xl font-bold text-primary mt-2">{stats.totalReadings}</div>
        </div>
      </div>

      {/* Main Grid: Device Cards + Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Device Reading Cards */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-primary">Live Device Readings</h4>
            <button onClick={() => navigate('/devices')} className="text-xs font-medium text-primary hover:underline">Manage Devices →</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {deviceCards.length > 0 ? deviceCards.map(reading => {
              const level = getReadingLevel(reading);
              const styles = getLevelStyles(level);
              return (
                <div key={reading.location} className={`${styles.bg} ${styles.border} border rounded-xl p-5 transition-all duration-300 hover:shadow-md cursor-pointer`} onClick={() => navigate('/monitoring')}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-semibold text-sm text-primary truncate max-w-[180px]">{reading.location || 'Unknown'}</h5>
                      <span className="text-[10px] text-on-surface-variant">{timeAgo(reading.created_at)}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${styles.badge}`}>
                      {level}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-medium">Temperature</span>
                      <div className={`text-2xl font-bold ${reading.temperature >= 60 ? 'text-red-600' : 'text-primary'}`}>
                        {reading.temperature}°C
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-on-surface-variant uppercase font-medium">Smoke</span>
                      <div className={`text-2xl font-bold ${reading.smoke >= 850 ? 'text-red-600' : 'text-primary'}`}>
                        {reading.smoke}
                      </div>
                    </div>
                  </div>
                  {/* Status bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className={`flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden`}>
                      <div className={`h-full rounded-full transition-all duration-500 ${
                        level === 'danger' ? 'bg-red-500 w-full' : level === 'warning' ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-1/4'
                      }`}></div>
                    </div>
                    <span className={`text-[10px] font-bold ${styles.text}`}>
                      {reading.status}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-2 text-center py-12 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-30">sensors_off</span>
                <p className="text-sm">No device readings yet. Waiting for ESP32 data…</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Alerts Panel */}
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-primary">Recent Alerts</h4>
            <button onClick={() => navigate('/alerts')} className="text-xs font-medium text-primary hover:underline">View All →</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {unresolvedAlerts.length > 0 ? unresolvedAlerts.slice(0, 15).map(alert => (
              <div key={alert.id} className={`p-3 rounded-lg border ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-2">
                  <span className={`material-symbols-outlined text-sm mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    {alert.severity === 'critical' ? 'crisis_alert' : 'warning'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary leading-snug truncate">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                      }`}>{alert.severity}</span>
                      <span className="text-[10px] text-on-surface-variant">{timeAgo(alert.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2 opacity-30">check_circle</span>
                <p className="text-sm">No active alerts</p>
                <p className="text-xs mt-1">System operating normally</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
