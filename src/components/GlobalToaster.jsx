import React from 'react';
import { useSupabase } from '../context/SupabaseDataContext';
import { useNavigate } from 'react-router-dom';

export default function GlobalToaster() {
  const { toastAlerts } = useSupabase();
  const navigate = useNavigate();

  if (!toastAlerts || toastAlerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[999] flex flex-col gap-3 pointer-events-none">
      {toastAlerts.map(toast => {
        const isCritical = toast.severity === 'critical';
        return (
          <div 
            key={toast.toastId} 
            className={`w-80 p-4 rounded-xl shadow-2xl pointer-events-auto border-l-4 transition-all duration-300 transform translate-x-0 ${
              isCritical ? 'bg-red-50 border-red-600' : 'bg-amber-50 border-amber-500'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-symbols-outlined text-[20px] ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                  {isCritical ? 'crisis_alert' : 'warning'}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
                  NEW {toast.severity} ALERT
                </span>
              </div>
            </div>
            
            <p className={`text-sm font-semibold mb-3 ${isCritical ? 'text-red-900' : 'text-amber-900'}`}>
              {toast.message}
            </p>
            
            <button 
              onClick={() => navigate('/alerts')}
              className={`w-full py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                isCritical ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              Take Action
            </button>
          </div>
        );
      })}
    </div>
  );
}
