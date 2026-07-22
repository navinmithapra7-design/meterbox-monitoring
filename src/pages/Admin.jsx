import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseDataContext';
import { timeAgo, readingsToCSV, downloadCSV } from '../lib/dataUtils';

const ADMIN_PASSWORD = 'admin@123';

export default function Admin() {
  const {
    alerts, acknowledgeAlert, resolveAlert,
    devices, addDevice, updateDevice, deleteDevice,
    reports, saveReport, queryReadings,
    isLoading
  } = useSupabase();

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('alerts');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setLoginError('');
    } else {
      setLoginError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
  };

  // ─── Login Gate ─────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="mx-auto py-12 px-4" style={{ width: '100%', maxWidth: '448px' }}>
        {/* Login Card */}
        <div className="w-full bg-surface border border-outline-variant rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="w-full bg-primary px-8 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-on-primary/10 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-on-primary/25">
              <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                admin_panel_settings
              </span>
            </div>
            <h2 className="text-2xl font-bold text-on-primary">Admin Access</h2>
            <p className="text-on-primary/70 text-sm mt-1">Full system control panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full p-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                  lock
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setLoginError(''); }}
                  placeholder="Enter admin password"
                  autoFocus
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-on-surface-variant/50"
                />
              </div>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <span className="material-symbols-outlined text-red-500 text-[18px]">error</span>
                <span className="text-sm text-red-700 dark:text-red-400 font-medium">{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-on-primary rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">login</span>
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-4">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">info</span>
          Authorized personnel only
        </p>
      </div>
    );
  }

  // ─── Tab counts ─────────────────────────────────────────────
  const activeAlerts = alerts.filter(a => !a.is_resolved).length;

  const tabs = [
    { id: 'alerts', label: 'Alerts', icon: 'notifications', count: activeAlerts },
    { id: 'devices', label: 'Devices', icon: 'settings_input_antenna', count: devices.length },
    { id: 'reports', label: 'Reports', icon: 'analytics', count: reports.length },
  ];

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-primary tracking-tight">Admin Panel</h2>
        <div className="h-64 bg-surface border border-outline-variant rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-primary tracking-tight">Admin Panel</h2>
            <p className="text-base text-on-surface-variant mt-0.5">Full system management access</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="px-4 py-2 bg-surface text-on-surface-variant border border-outline-variant hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all rounded-lg text-xs font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">lock</span> Lock Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-container-low border border-outline-variant rounded-xl p-1.5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}>
            <span className="material-symbols-outlined text-[18px]" style={activeTab === tab.id ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
            {tab.label}
            {tab.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-highest text-on-surface-variant'
              }`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'alerts' && <AlertsTab alerts={alerts} acknowledgeAlert={acknowledgeAlert} resolveAlert={resolveAlert} />}
      {activeTab === 'devices' && <DevicesTab devices={devices} addDevice={addDevice} updateDevice={updateDevice} deleteDevice={deleteDevice} />}
      {activeTab === 'reports' && <ReportsTab devices={devices} reports={reports} saveReport={saveReport} queryReadings={queryReadings} />}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// ALERTS TAB
// ═══════════════════════════════════════════════════════════════
function AlertsTab({ alerts, acknowledgeAlert, resolveAlert }) {
  const [filter, setFilter] = useState('All Active');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All Active') return !alert.is_resolved;
    if (filter === 'Critical Only') return !alert.is_resolved && alert.severity === 'critical';
    if (filter === 'Resolved') return alert.is_resolved;
    return true;
  });

  const activeCount = alerts.filter(a => !a.is_resolved).length;
  const criticalCount = alerts.filter(a => !a.is_resolved && a.severity === 'critical').length;
  const acknowledgedCount = alerts.filter(a => a.is_acknowledged && !a.is_resolved).length;

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Critical Alerts" value={criticalCount} color="red" icon="crisis_alert" />
        <StatCard label="Acknowledged" value={acknowledgedCount} color="amber" icon="done_all" />
        <StatCard label="Total Active" value={activeCount} color="primary" icon="notifications_active" />
      </div>

      {/* Alert List */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-3 bg-surface-container-low">
          <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
            {['All Active', 'Critical Only', 'Resolved', 'All Time'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'
                }`}>{f}</button>
            ))}
          </div>
          <span className="text-xs font-medium text-on-surface-variant shrink-0">{filteredAlerts.length} Alerts</span>
        </div>

        <div className="divide-y divide-outline-variant max-h-[600px] overflow-y-auto">
          {filteredAlerts.length > 0 ? filteredAlerts.map(alert => (
            <div key={alert.id} className={`p-5 transition-colors ${
              alert.is_resolved ? 'bg-surface-container-lowest opacity-60' :
              alert.severity === 'critical' ? 'bg-red-50/30 dark:bg-red-900/10' : 'bg-amber-50/30 dark:bg-amber-900/10'
            }`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  alert.is_resolved ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                  alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                }`}>
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {alert.is_resolved ? 'check_circle' : alert.severity === 'critical' ? 'crisis_alert' : 'warning'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      alert.is_resolved ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                      alert.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                    }`}>{alert.is_resolved ? 'Resolved' : alert.severity}</span>
                    <span className="text-xs font-semibold text-primary">{alert.location || 'Unknown'}</span>
                    <span className="text-xs text-on-surface-variant">• {timeAgo(alert.created_at)}</span>
                  </div>
                  <p className={`text-sm mt-1 ${alert.is_resolved ? 'text-on-surface-variant' : 'text-primary font-medium'}`}>{alert.message}</p>
                  {(!alert.is_resolved) && (
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs bg-surface border border-outline-variant/50 rounded px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">thermostat</span>{alert.temperature ?? '--'}°C
                      </span>
                      <span className="text-xs bg-surface border border-outline-variant/50 rounded px-2 py-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">cloud</span>{alert.smoke ?? '--'}
                      </span>
                    </div>
                  )}
                  {alert.is_acknowledged && !alert.is_resolved && alert.acknowledged_at && (
                    <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                      Acknowledged on {new Date(alert.acknowledged_at).toLocaleString()}
                    </p>
                  )}
                </div>
                {!alert.is_resolved && (
                  <div className="flex md:flex-col gap-2 shrink-0">
                    {!alert.is_acknowledged && (
                      <button onClick={() => acknowledgeAlert(alert.id)}
                        className="px-3 py-2 bg-surface text-primary border border-outline-variant hover:bg-surface-container-low transition-colors rounded-lg text-xs font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">done_all</span>Acknowledge
                      </button>
                    )}
                    <button onClick={() => resolveAlert(alert.id)}
                      className="px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors rounded-lg text-xs font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          )) : (
            <EmptyState icon="task_alt" title="All Clear" description="No alerts match the current filter." />
          )}
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// DEVICES TAB
// ═══════════════════════════════════════════════════════════════
function DevicesTab({ devices, addDevice, updateDevice, deleteDevice }) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    device_name: '', location: '', sector: '', zone: '', notes: '', status: 'active'
  });

  const resetForm = () => {
    setFormData({ device_name: '', location: '', sector: '', zone: '', notes: '', status: 'active' });
    setIsEditing(false); setCurrentId(null); setShowForm(false);
  };

  const handleEdit = (device) => {
    setFormData({
      device_name: device.device_name, location: device.location,
      sector: device.sector || '', zone: device.zone || '', notes: device.notes || '', status: device.status
    });
    setIsEditing(true); setCurrentId(device.id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this device?')) await deleteDevice(id);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) await updateDevice(currentId, formData);
    else await addDevice(formData);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Header with Add button */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-primary">Device Management</h3>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary-container transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> Register Device
        </button>
      </div>

      {/* Device Form */}
      {showForm && (
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary">{isEditing ? 'Edit Device' : 'Register New Device'}</h3>
            <button onClick={resetForm} className="text-on-surface-variant hover:text-primary">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Device Name / ID</label>
                <input required type="text" name="device_name" value={formData.device_name} onChange={handleInputChange} placeholder="e.g. ESP32-001" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Location</label>
                <input required type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Sector 12 Yard" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Sector (Optional)</label>
                <input type="text" name="sector" value={formData.sector} onChange={handleInputChange} placeholder="e.g. North" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Zone (Optional)</label>
                <input type="text" name="zone" value={formData.zone} onChange={handleInputChange} placeholder="e.g. Residential" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Installation notes..." rows="2" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium hover:bg-surface-container-low transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
                {isEditing ? 'Save Changes' : 'Register Device'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Device Table */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Device / Location</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Details</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {devices.length > 0 ? devices.map(device => (
                <tr key={device.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4 px-6">
                    <div className="font-semibold text-sm text-primary">{device.device_name}</div>
                    <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>{device.location}
                    </div>
                  </td>
                  <td className="p-4 px-6">
                    <div className="text-xs text-on-surface">Sector: <span className="font-medium text-primary">{device.sector || '—'}</span></div>
                    <div className="text-xs text-on-surface mt-1">Zone: <span className="font-medium text-primary">{device.zone || '—'}</span></div>
                  </td>
                  <td className="p-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      device.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400' :
                      device.status === 'maintenance' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'active' ? 'bg-emerald-500' : device.status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-500'}`}></span>
                      {device.status}
                    </span>
                  </td>
                  <td className="p-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(device)} className="p-1.5 text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-surface-container-highest rounded-lg transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(device.id)} className="p-1.5 text-on-surface-variant hover:text-red-600 bg-surface-container-low hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4"><EmptyState icon="dns" title="No Devices" description="Register your first ESP32 device above." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// REPORTS TAB
// ═══════════════════════════════════════════════════════════════
function ReportsTab({ devices, reports, saveReport, queryReadings }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportResult, setReportResult] = useState(null);
  const [formData, setFormData] = useState({
    title: '', report_type: 'daily', device_id: 'all',
    date_from: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setReportResult(null);

    const fromStr = `${formData.date_from}T00:00:00.000Z`;
    const toStr = `${formData.date_to}T23:59:59.999Z`;
    const devId = formData.device_id === 'all' ? null : formData.device_id;

    const { success, data: reportReadings, error } = await queryReadings(fromStr, toStr, devId);
    if (!success) {
      setReportResult({ success: false, message: error });
      setIsGenerating(false);
      return;
    }

    let maxT = 0, minT = 999, sumT = 0, countT = 0;
    let maxS = 0, sumS = 0, countS = 0;
    let alertCount = 0;

    reportReadings.forEach(r => {
      if (r.temperature != null) { if (r.temperature > maxT) maxT = r.temperature; if (r.temperature < minT) minT = r.temperature; sumT += r.temperature; countT++; }
      if (r.smoke != null) { if (r.smoke > maxS) maxS = r.smoke; sumS += r.smoke; countS++; }
      if (r.status === 'ALERT') alertCount++;
    });

    const reportData = {
      title: formData.title || `Report - ${formData.report_type.toUpperCase()}`,
      report_type: formData.report_type, device_id: devId,
      date_from: fromStr, date_to: toStr, generated_by: 'Dept. Admin',
      total_readings: reportReadings.length, total_alerts: alertCount,
      max_temperature: countT > 0 ? maxT : 0, min_temperature: countT > 0 ? minT : 0,
      avg_temperature: countT > 0 ? Math.round(sumT / countT * 10) / 10 : 0,
      max_smoke: countS > 0 ? maxS : 0, avg_smoke: countS > 0 ? Math.round(sumS / countS) : 0,
    };

    const saveRes = await saveReport(reportData);
    if (saveRes.success) {
      setReportResult({ success: true, message: 'Report generated successfully.', data: saveRes.data, readings: reportReadings });
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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-5 bg-surface border border-outline-variant rounded-xl p-6 h-fit">
          <h3 className="text-lg font-semibold text-primary mb-4 border-b border-outline-variant/50 pb-2">Generate Report</h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Report Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Q3 Sector 12 Audit" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Type</label>
                <select name="report_type" value={formData.report_type} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Device/Location</label>
                <select name="device_id" value={formData.device_id} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10">
                  <option value="all">All Devices (Aggregate)</option>
                  {devices.map(d => (<option key={d.id} value={d.id}>{d.device_name} - {d.location}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Date From</label>
                <input required type="date" name="date_from" value={formData.date_from} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Date To</label>
                <input required type="date" name="date_to" value={formData.date_to} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" />
              </div>
            </div>
            <button type="submit" disabled={isGenerating}
              className="w-full mt-4 bg-primary text-on-primary py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {isGenerating ? (<><span className="material-symbols-outlined text-sm animate-spin">progress_activity</span> Compiling Data...</>) : 'Generate Report'}
            </button>
          </form>

          {/* Result Block */}
          {reportResult && (
            <div className={`mt-6 p-4 rounded-xl border ${reportResult.success ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[20px] ${reportResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                  {reportResult.success ? 'check_circle' : 'error'}
                </span>
                <span className={`font-semibold text-sm ${reportResult.success ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'}`}>
                  {reportResult.message}
                </span>
              </div>
              {reportResult.success && reportResult.data && (
                <div className="space-y-3 mt-3 pt-3 border-t border-emerald-200/50 dark:border-emerald-800/50">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-surface-container-low p-2 rounded-lg">
                      <span className="text-on-surface-variant block">Total Readings</span>
                      <span className="font-bold text-lg text-primary">{reportResult.data.total_readings}</span>
                    </div>
                    <div className="bg-surface-container-low p-2 rounded-lg">
                      <span className="text-on-surface-variant block">Alert Events</span>
                      <span className="font-bold text-lg text-primary">{reportResult.data.total_alerts}</span>
                    </div>
                  </div>
                  <button onClick={handleDownloadCSV}
                    className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
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
            <h3 className="text-lg font-semibold text-primary">Report Archives</h3>
            <span className="text-xs font-medium text-on-surface-variant bg-surface-container px-2 py-1 rounded-full">{reports.length} Saved</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-outline-variant">
            {reports.length > 0 ? reports.map(r => (
              <div key={r.id} className="p-5 hover:bg-surface-container-lowest transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-surface-container border border-outline-variant/50 rounded text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{r.report_type}</span>
                  <h4 className="font-semibold text-primary text-sm">{r.title}</h4>
                </div>
                <p className="text-xs text-on-surface-variant mb-2">
                  {new Date(r.date_from).toLocaleDateString()} → {new Date(r.date_to).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="text-on-surface-variant">Readings: <b className="text-primary">{r.total_readings}</b></span>
                  <span className="text-on-surface-variant">Alerts: <b className="text-red-600">{r.total_alerts}</b></span>
                  <span className="text-on-surface-variant">Max Temp: <b className="text-primary">{r.max_temperature}°C</b></span>
                </div>
              </div>
            )) : (
              <EmptyState icon="folder_open" title="No Reports" description="Generate your first report using the form." />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function StatCard({ label, value, color, icon }) {
  const colorMap = {
    red: { bg: 'bg-red-50 dark:bg-red-900/10', text: 'text-red-600', iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-900/10', text: 'text-amber-500', iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
    primary: { bg: 'bg-primary/5', text: 'text-primary', iconBg: 'bg-surface-container-high text-primary' },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
      <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative z-10 ${c.iconBg}`}>
        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
      </div>
      <div className="relative z-10">
        <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider block">{label}</span>
        <div className={`text-3xl font-bold ${c.text} mt-0.5`}>{value}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="py-16 text-center">
      <div className="w-16 h-16 bg-surface-container-low text-on-surface-variant rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-3xl">{icon}</span>
      </div>
      <h4 className="text-lg font-semibold text-primary">{title}</h4>
      <p className="text-sm text-on-surface-variant mt-1">{description}</p>
    </div>
  );
}
