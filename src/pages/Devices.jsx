import React from 'react';
import { useSupabase } from '../context/SupabaseDataContext';

export default function Devices() {
  const { devices, isLoading } = useSupabase();

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-primary tracking-tight">Device Fleet</h2>
        <div className="h-64 bg-surface border border-outline-variant rounded-xl animate-pulse"></div>
      </div>
    );
  }

  const activeCount = devices.filter(d => d.status === 'active').length;
  const maintenanceCount = devices.filter(d => d.status === 'maintenance').length;
  const inactiveCount = devices.filter(d => d.status === 'inactive').length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Device Fleet</h2>
          <p className="text-base text-on-surface-variant mt-1">ESP32 smart meter installations overview</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-2">
          <span className="px-3 py-1.5 bg-surface border border-outline-variant rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {activeCount} Active
          </span>
          {maintenanceCount > 0 && (
            <span className="px-3 py-1.5 bg-surface border border-outline-variant rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              {maintenanceCount} Maintenance
            </span>
          )}
        </div>
      </div>

      {/* Device Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.length > 0 ? devices.map(device => (
          <div key={device.id} className="bg-surface border border-outline-variant rounded-xl p-5 hover:shadow-md transition-all duration-200 group">
            {/* Header Row */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  device.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                  device.status === 'maintenance' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {device.status === 'active' ? 'sensors' : device.status === 'maintenance' ? 'build' : 'sensors_off'}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-primary">{device.device_name}</h4>
                  <p className="text-[11px] text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">location_on</span>
                    {device.location}
                  </p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                device.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                device.status === 'maintenance' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  device.status === 'active' ? 'bg-emerald-500' :
                  device.status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-400'
                }`}></span>
                {device.status}
              </span>
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-outline-variant/50">
              <div className="text-xs">
                <span className="text-on-surface-variant">Sector</span>
                <p className="font-medium text-primary mt-0.5">{device.sector || '—'}</p>
              </div>
              <div className="text-xs">
                <span className="text-on-surface-variant">Zone</span>
                <p className="font-medium text-primary mt-0.5">{device.zone || '—'}</p>
              </div>
            </div>

            {/* Notes */}
            {device.notes && (
              <div className="mt-3 pt-3 border-t border-outline-variant/50">
                <p className="text-[11px] text-on-surface-variant italic">"{device.notes}"</p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-3 border-t border-outline-variant/50 flex items-center justify-between">
              <span className="text-[10px] text-on-surface-variant">
                Installed: {device.created_at ? new Date(device.created_at).toLocaleDateString() : '—'}
              </span>
              <span className="text-[10px] text-on-surface-variant px-2 py-0.5 bg-surface-container-low rounded">
                ID: {device.id?.slice(0, 8)}...
              </span>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 text-center">
            <div className="w-16 h-16 bg-surface-container-low text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">dns</span>
            </div>
            <h4 className="text-lg font-semibold text-primary">No Devices Registered</h4>
            <p className="text-sm text-on-surface-variant mt-1">Devices can be registered from the Admin Panel.</p>
          </div>
        )}
      </div>
    </div>
  );
}
