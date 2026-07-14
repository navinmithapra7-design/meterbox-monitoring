import React, { useState } from 'react';
import { useSupabase } from '../context/SupabaseDataContext';
import { timeAgo } from '../lib/dataUtils';

export default function Devices() {
  const { devices, addDevice, updateDevice, deleteDevice, isLoading } = useSupabase();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    device_name: '',
    location: '',
    sector: '',
    zone: '',
    notes: '',
    status: 'active'
  });

  const resetForm = () => {
    setFormData({ device_name: '', location: '', sector: '', zone: '', notes: '', status: 'active' });
    setIsEditing(false);
    setCurrentId(null);
    setShowForm(false);
  };

  const handleEdit = (device) => {
    setFormData({
      device_name: device.device_name,
      location: device.location,
      sector: device.sector || '',
      zone: device.zone || '',
      notes: device.notes || '',
      status: device.status
    });
    setIsEditing(true);
    setCurrentId(device.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this device?')) {
      await deleteDevice(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await updateDevice(currentId, formData);
    } else {
      await addDevice(formData);
    }
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h2 className="text-4xl font-bold text-primary tracking-tight">Device Management</h2>
        <div className="h-64 bg-surface border border-outline-variant rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end">
        <div>
          <h2 className="text-4xl font-bold text-primary tracking-tight">Device Management</h2>
          <p className="text-base text-on-surface-variant mt-1">Manage ESP32 smart meter installations</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add</span> Register Device
          </button>
        </div>
      </div>

      {/* Device Form Modal (Inline for now) */}
      {showForm && (
        <div className="bg-surface border border-outline-variant rounded-xl p-6 shadow-md mb-6">
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
                <input required type="text" name="device_name" value={formData.device_name} onChange={handleInputChange} placeholder="e.g. ESP32-001" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Location</label>
                <input required type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Sector 12 Yard" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Sector (Optional)</label>
                <input type="text" name="sector" value={formData.sector} onChange={handleInputChange} placeholder="e.g. North" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Zone (Optional)</label>
                <input type="text" name="zone" value={formData.zone} onChange={handleInputChange} placeholder="e.g. Residential" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Installation notes..." rows="2" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-sm focus:outline-none focus:border-primary"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button type="button" onClick={resetForm} className="px-4 py-2 border border-outline-variant rounded text-sm font-medium hover:bg-surface-container-low transition-colors">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded text-sm font-medium hover:bg-primary-container transition-colors">
                {isEditing ? 'Save Changes' : 'Register Device'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Device List */}
      <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-lg font-semibold text-primary">Registered Fleet</h3>
          <span className="text-xs font-medium text-on-surface-variant bg-surface-container-low px-2 py-1 rounded-full">{devices.length} Devices</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Device / Location</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Details</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest">Installed</th>
                <th className="p-3 px-6 text-[11px] font-semibold text-on-surface-variant uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {devices.length > 0 ? devices.map(device => (
                <tr key={device.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="p-4 px-6">
                    <div className="font-semibold text-sm text-primary">{device.device_name}</div>
                    <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[14px]">location_on</span>
                      {device.location}
                    </div>
                  </td>
                  <td className="p-4 px-6">
                    <div className="text-xs text-on-surface">Sector: <span className="font-medium text-primary">{device.sector || '—'}</span></div>
                    <div className="text-xs text-on-surface mt-1">Zone: <span className="font-medium text-primary">{device.zone || '—'}</span></div>
                  </td>
                  <td className="p-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      device.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                      device.status === 'maintenance' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        device.status === 'active' ? 'bg-emerald-500' :
                        device.status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-500'
                      }`}></span>
                      {device.status}
                    </span>
                  </td>
                  <td className="p-4 px-6 text-sm text-on-surface-variant">
                    {device.installed_date ? new Date(device.installed_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="p-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(device)} className="p-1.5 text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-surface-container-highest rounded transition-colors" title="Edit">
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button onClick={() => handleDelete(device.id)} className="p-1.5 text-on-surface-variant hover:text-red-600 bg-surface-container-low hover:bg-red-50 rounded transition-colors" title="Delete">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-30 block">dns</span>
                    <p className="text-sm font-medium text-primary">No devices registered</p>
                    <p className="text-xs mt-1">Click "Register Device" to add your first ESP32 meter.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
