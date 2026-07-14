import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseDataContext';
import { readingsToCSV, downloadCSV } from '../lib/dataUtils';

export default function Reports() {
  const { devices, reports, saveReport, queryReadings, isLoading } = useSupabase();
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    report_type: 'daily',
    device_id: 'all',
    date_from: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0], // Yesterday
    date_to: new Date().toISOString().split('T')[0], // Today
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setReportResult(null);

    // 1. Convert local dates to ISO strings covering full days
    const fromStr = `${formData.date_from}T00:00:00.000Z`;
    const toStr = `${formData.date_to}T23:59:59.999Z`;
    const devId = formData.device_id === 'all' ? null : formData.device_id;

    // 2. Query readings
    const { success, data: reportReadings, error } = await queryReadings(fromStr, toStr, devId);

    if (!success) {
      setReportResult({ success: false, message: error });
      setIsGenerating(false);
      return;
    }

    // 3. Compute stats
    let maxT = 0, minT = 999, sumT = 0, countT = 0;
    let maxS = 0, sumS = 0, countS = 0;
    let alertCount = 0;

    reportReadings.forEach(r => {
      if (r.temperature != null) {
        if (r.temperature > maxT) maxT = r.temperature;
        if (r.temperature < minT) minT = r.temperature;
        sumT += r.temperature;
        countT++;
      }
      if (r.smoke != null) {
        if (r.smoke > maxS) maxS = r.smoke;
        sumS += r.smoke;
        countS++;
      }
      if (r.status === 'ALERT') alertCount++;
    });

    const reportData = {
      title: formData.title || `Report - ${formData.report_type.toUpperCase()}`,
      report_type: formData.report_type,
      device_id: devId,
      date_from: fromStr,
      date_to: toStr,
      generated_by: 'Dept. Admin',
      total_readings: reportReadings.length,
      total_alerts: alertCount,
      max_temperature: countT > 0 ? maxT : 0,
      min_temperature: countT > 0 ? minT : 0,
      avg_temperature: countT > 0 ? Math.round(sumT / countT * 10) / 10 : 0,
      max_smoke: countS > 0 ? maxS : 0,
      avg_smoke: countS > 0 ? Math.round(sumS / countS) : 0,
    };

    // 4. Save to DB
    const saveRes = await saveReport(reportData);

    // 5. Store result for UI
    if (saveRes.success) {
      setReportResult({
        success: true,
        message: 'Report generated successfully.',
        data: saveRes.data,
        readings: reportReadings // keeping for CSV export
      });
    } else {
      setReportResult({ success: false, message: saveRes.error });
    }

    setIsGenerating(false);
  };

  const handleDownloadCSV = () => {
    if (reportResult && reportResult.readings) {
      const csv = readingsToCSV(reportResult.readings);
      downloadCSV(csv, `export_${reportResult.data.id}.csv`);
    }
  };

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
          <p className="text-base text-on-surface-variant mt-1">Generate official department exports and summaries</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Generator Form */}
        <div className="lg:col-span-5 bg-surface border border-outline-variant rounded-xl p-6 h-fit">
          <h3 className="text-lg font-semibold text-primary mb-4 border-b border-outline-variant/50 pb-2">Generate Report</h3>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Report Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Q3 Sector 12 Audit" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Type</label>
                <select name="report_type" value={formData.report_type} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Device/Location</label>
                <select name="device_id" value={formData.device_id} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary">
                  <option value="all">All Devices (Aggregate)</option>
                  {devices.map(d => (
                    <option key={d.id} value={d.id}>{d.device_name} - {d.location}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Date From</label>
                <input required type="date" name="date_from" value={formData.date_from} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Date To</label>
                <input required type="date" name="date_to" value={formData.date_to} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isGenerating}
              className="w-full mt-4 bg-primary text-on-primary py-2.5 rounded font-semibold text-sm hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Compiling Data...</>
              ) : (
                'Generate Report'
              )}
            </button>
          </form>

          {/* Result Block */}
          {reportResult && (
            <div className={`mt-6 p-4 rounded-lg border ${reportResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[20px] ${reportResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                  {reportResult.success ? 'check_circle' : 'error'}
                </span>
                <span className={`font-semibold text-sm ${reportResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                  {reportResult.message}
                </span>
              </div>
              
              {reportResult.success && reportResult.data && (
                <div className="space-y-3 mt-3 pt-3 border-t border-emerald-200/50">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/60 p-2 rounded">
                      <span className="text-emerald-700 font-medium block">Total Readings</span>
                      <span className="text-emerald-900 font-bold text-lg">{reportResult.data.total_readings}</span>
                    </div>
                    <div className="bg-white/60 p-2 rounded">
                      <span className="text-emerald-700 font-medium block">Alert Events</span>
                      <span className="text-emerald-900 font-bold text-lg">{reportResult.data.total_alerts}</span>
                    </div>
                  </div>
                  <button onClick={handleDownloadCSV} className="w-full py-2 bg-emerald-600 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">download</span> Export Raw CSV
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Report History */}
        <div className="lg:col-span-7 bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h3 className="text-lg font-semibold text-primary">Department Report Archives</h3>
            <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">{reports.length} Saved</span>
          </div>
          
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {reports.length > 0 ? reports.map(r => (
              <div key={r.id} className="p-5 border-b border-outline-variant hover:bg-surface-container-lowest transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start">
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
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
                    <div><span className="text-on-surface-variant">Readings:</span> <span className="font-semibold text-primary">{r.total_readings}</span></div>
                    <div><span className="text-on-surface-variant">Alerts:</span> <span className="font-semibold text-red-600">{r.total_alerts}</span></div>
                    <div><span className="text-on-surface-variant">Max Temp:</span> <span className="font-semibold text-primary">{r.max_temperature}°C</span></div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 border-outline-variant/50 pt-3 sm:pt-0">
                  <span className="text-[10px] text-on-surface-variant mb-1">Generated: {new Date(r.created_at).toLocaleDateString()}</span>
                  <button disabled className="px-3 py-1.5 border border-outline-variant rounded text-xs font-medium text-on-surface-variant opacity-50 cursor-not-allowed flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> PDF (Coming Soon)
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-16 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-30 block">folder_open</span>
                <p className="text-sm font-medium text-primary">No reports archived</p>
                <p className="text-xs mt-1">Generate your first report using the form.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
