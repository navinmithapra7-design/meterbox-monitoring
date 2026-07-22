import React from 'react';
import { useSupabase } from '../context/SupabaseDataContext';

export default function Reports() {
  const { reports, isLoading } = useSupabase();

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-primary tracking-tight">Reports & Analysis</h2>
        <div className="h-64 bg-surface border border-outline-variant rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Reports & Analysis</h2>
          <p className="text-base text-on-surface-variant mt-1">Department report archives and summaries</p>
        </div>
        <span className="mt-2 sm:mt-0 text-xs font-medium text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant">
          {reports.length} Reports Archived
        </span>
      </div>

      {/* Report History */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
          <h3 className="text-lg font-semibold text-primary">Department Report Archives</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">Reports can be generated from the Admin Panel</p>
        </div>
        
        <div className="divide-y divide-outline-variant">
          {reports.length > 0 ? reports.map(r => (
            <div key={r.id} className="p-5 hover:bg-surface-container-lowest transition-colors">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-surface-container border border-outline-variant/50 rounded text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                      {r.report_type}
                    </span>
                    <h4 className="font-semibold text-primary">{r.title}</h4>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-3">
                    Coverage: {new Date(r.date_from).toLocaleDateString()} to {new Date(r.date_to).toLocaleDateString()}
                  </p>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-surface-container-low rounded-lg p-2.5">
                      <span className="text-[10px] text-on-surface-variant block">Readings</span>
                      <span className="text-lg font-bold text-primary">{r.total_readings}</span>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-2.5">
                      <span className="text-[10px] text-on-surface-variant block">Alerts</span>
                      <span className="text-lg font-bold text-red-600">{r.total_alerts}</span>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-2.5">
                      <span className="text-[10px] text-on-surface-variant block">Max Temp</span>
                      <span className="text-lg font-bold text-primary">{r.max_temperature}°C</span>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-2.5">
                      <span className="text-[10px] text-on-surface-variant block">Avg Temp</span>
                      <span className="text-lg font-bold text-primary">{r.avg_temperature}°C</span>
                    </div>
                    <div className="bg-surface-container-low rounded-lg p-2.5">
                      <span className="text-[10px] text-on-surface-variant block">Max Smoke</span>
                      <span className="text-lg font-bold text-primary">{r.max_smoke}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] text-on-surface-variant">
                    Generated: {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    By: {r.generated_by || 'System'}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-16 text-center text-on-surface-variant">
              <div className="w-16 h-16 bg-surface-container-low text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">folder_open</span>
              </div>
              <h4 className="text-lg font-semibold text-primary">No Reports Archived</h4>
              <p className="text-sm text-on-surface-variant mt-1">Reports can be generated from the Admin Panel.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
