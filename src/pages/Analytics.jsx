import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useSupabase } from '../context/SupabaseDataContext';
import { buildTrendData, getMostActiveLocation, getMaintenanceList } from '../data/analytics';

export default function Analytics() {
  const { readings, isLoading } = useSupabase();
  const [timeRange, setTimeRange] = useState('24h');

  const trendData = useMemo(() => buildTrendData(readings, timeRange), [readings, timeRange]);
  const activeLocation = useMemo(() => getMostActiveLocation(readings), [readings]);
  const maintenanceList = useMemo(() => getMaintenanceList(readings), [readings]);

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto min-h-[calc(100vh-4rem)]">
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Analytics & Reports</h2>
          <p className="text-base text-on-surface-variant mt-2">Loading analytics data…</p>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 h-[350px] animate-pulse">
          <div className="h-4 bg-surface-container-high rounded w-1/3 mb-6"></div>
          <div className="h-full bg-surface-container-high rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">Analytics & Reports</h2>
          <p className="text-base text-on-surface-variant mt-2">
            Live thermal analysis from ESP32 sensor data.
          </p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button className="px-4 py-2 border border-primary text-primary hover:bg-tertiary-fixed transition-colors rounded text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Most Active Location Card */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary">Hottest Location</h3>
            <span className="material-symbols-outlined text-tertiary">warning</span>
          </div>
          <div className="mb-2">
            <span className="text-2xl font-bold text-primary leading-tight">{activeLocation.location}</span>
          </div>
          <p className="text-sm text-on-surface-variant mb-4">
            Highest temperature variance detected over the selected period.
          </p>
          <div className="flex items-center gap-2 mt-auto border-t border-outline-variant pt-4">
            <span className="material-symbols-outlined text-error text-[20px]">trending_up</span>
            <span className="text-base font-semibold text-error">+{activeLocation.variance}°C Variance</span>
            <span className="text-xs font-medium text-on-surface-variant ml-auto">Avg: {activeLocation.avgTemp}°C</span>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-outline-variant/30 pb-2">
            <h3 className="text-xl font-semibold text-primary">Temperature & Smoke Trends</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-outline-variant rounded px-2 py-1 text-[11px] font-semibold tracking-widest uppercase bg-surface text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 min-h-[250px] relative w-full rounded pt-4">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#858383' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#858383' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1c1b1b', color: '#fff', borderRadius: '8px', border: 'none' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#000000" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="smoke" name="Smoke" stroke="#e9e5b0" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-on-surface-variant text-sm">
                <div className="text-center">
                  <span className="material-symbols-outlined text-3xl mb-2 block opacity-40">show_chart</span>
                  No data available for this time range.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Maintenance Table */}
        <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mt-2">
          <h3 className="text-xl font-semibold text-primary mb-2">Preventive Maintenance Required</h3>
          <p className="text-sm text-on-surface-variant mb-6">
            Locations showing elevated temperatures or rising thermal trends needing inspection.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-2 px-4 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Location</th>
                  <th className="py-2 px-4 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Current Temp</th>
                  <th className="py-2 px-4 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Trend (24h)</th>
                  <th className="py-2 px-4 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest whitespace-nowrap">Status</th>
                  <th className="py-2 px-4 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {maintenanceList.length > 0 ? (
                  maintenanceList.map((record) => (
                    <tr key={record.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors group">
                      <td className="py-4 px-4 font-semibold text-primary">{record.location}</td>
                      <td className="py-4 px-4 text-on-surface">{record.current_temp}°C</td>
                      <td className="py-4 px-4 text-error flex items-center gap-1 font-medium">
                        <span className="material-symbols-outlined text-[16px]">arrow_upward</span> {record.trend_24h}%
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold tracking-widest uppercase ${
                          record.status === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button className="text-primary hover:text-tertiary-container text-[11px] font-bold tracking-widest uppercase transition-colors">
                          {record.action}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-2xl mb-2 block opacity-40">check_circle</span>
                      All locations within normal parameters. No maintenance required.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
