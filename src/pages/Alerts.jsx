import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseDataContext';
import { timeAgo } from '../lib/dataUtils';

export default function Alerts() {
  const { alerts, acknowledgeAlert, resolveAlert, isLoading } = useSupabase();
  const [filter, setFilter] = useState('All Active');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All Active') return !alert.is_resolved;
    if (filter === 'Critical Only') return !alert.is_resolved && alert.severity === 'critical';
    if (filter === 'Resolved') return alert.is_resolved;
    return true; // 'All'
  });

  const activeCount = alerts.filter(a => !a.is_resolved).length;
  const criticalCount = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length;
  const warningCount = alerts.filter(a => !a.is_resolved && a.severity === 'warning').length;

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-primary tracking-tight">Alert Management</h2>
        <div className="h-64 bg-surface border border-outline-variant rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Alert Management</h2>
          <p className="text-base text-on-surface-variant mt-1">Acknowledge and resolve system warnings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col h-32 relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider relative z-10">Critical Alerts</span>
          <div className="text-5xl font-bold text-red-600 mt-auto relative z-10">{criticalCount}</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col h-32 relative overflow-hidden group">
          <div className="absolute inset-0 bg-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider relative z-10">Warning Alerts</span>
          <div className="text-5xl font-bold text-amber-500 mt-auto relative z-10">{warningCount}</div>
        </div>
        <div className="bg-surface border border-outline-variant rounded-xl p-5 flex flex-col h-32 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider relative z-10">Total Active</span>
          <div className="text-5xl font-bold text-primary mt-auto relative z-10">{activeCount}</div>
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-low">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {['All Active', 'Critical Only', 'Resolved', 'All Time'].map(f => (
              <button
                key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                  filter === f
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <span className="text-xs font-medium text-on-surface-variant shrink-0">{filteredAlerts.length} Alerts</span>
        </div>

        <div className="divide-y divide-outline-variant">
          {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
            <div key={alert.id} className={`p-6 transition-colors ${
              alert.is_resolved ? 'bg-surface-container-lowest opacity-60' :
              alert.severity === 'critical' ? 'bg-red-50/30' : 'bg-amber-50/30'
            }`}>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Icon Column */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  alert.is_resolved ? 'bg-emerald-100 text-emerald-600' :
                  alert.severity === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {alert.is_resolved ? 'check_circle' : alert.severity === 'critical' ? 'crisis_alert' : 'warning'}
                  </span>
                </div>

                {/* Content Column */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.is_resolved ? 'bg-emerald-100 text-emerald-800' :
                      alert.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {alert.is_resolved ? 'Resolved' : alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-primary">{alert.location || 'Unknown Location'}</span>
                    <span className="text-xs text-on-surface-variant">• {timeAgo(alert.created_at)}</span>
                  </div>
                  
                  <p className={`text-base mt-2 ${alert.is_resolved ? 'text-on-surface-variant' : 'text-primary font-medium'}`}>
                    {alert.message}
                  </p>
                  
                  {/* Readings Snapshot */}
                  {(!alert.is_resolved) && (
                    <div className="flex gap-4 mt-3">
                      <div className="bg-surface border border-outline-variant/50 rounded px-3 py-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">thermostat</span>
                        <span className="text-sm font-semibold">{alert.temperature ?? '--'}°C</span>
                      </div>
                      <div className="bg-surface border border-outline-variant/50 rounded px-3 py-1.5 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">cloud</span>
                        <span className="text-sm font-semibold">{alert.smoke ?? '--'}</span>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  {alert.is_resolved && alert.resolved_at && (
                    <p className="text-xs text-on-surface-variant mt-2">
                      Resolved on {new Date(alert.resolved_at).toLocaleString()}
                    </p>
                  )}
                  {alert.is_acknowledged && !alert.is_resolved && alert.acknowledged_at && (
                    <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                      Acknowledged on {new Date(alert.acknowledged_at).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Actions Column */}
                {!alert.is_resolved && (
                  <div className="flex md:flex-col gap-2 shrink-0 md:w-32">
                    {!alert.is_acknowledged && (
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex-1 px-3 py-2 bg-surface text-primary border border-outline-variant hover:bg-surface-container-low transition-colors rounded text-xs font-semibold"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button 
                      onClick={() => resolveAlert(alert.id)}
                      className="flex-1 px-3 py-2 bg-primary text-on-primary hover:bg-primary-container transition-colors rounded text-xs font-semibold flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[16px]">check</span> Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">task_alt</span>
              </div>
              <h4 className="text-lg font-semibold text-primary">All Clear</h4>
              <p className="text-sm text-on-surface-variant mt-1">No alerts match your current filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
