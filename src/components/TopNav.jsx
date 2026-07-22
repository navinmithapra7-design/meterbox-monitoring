import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseDataContext';

export default function TopNav({ onMenuToggle }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || false;
  });
  
  const { isRealtime, lastSyncTime, isLoading, error, alerts } = useSupabase();
  const navigate = useNavigate();

  // Dark Mode Effect — syncs with sidebar toggle via storage event
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Listen for changes from other components (sidebar toggle)
  useEffect(() => {
    const handleStorageSync = () => {
      const currentTheme = localStorage.getItem('theme');
      setDarkMode(currentTheme === 'dark');
    };

    // Use a MutationObserver to watch for dark class changes on <html>
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setDarkMode(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const unresolvedAlertsCount = alerts.filter(a => !a.is_resolved).length;

  const syncLabel = lastSyncTime
    ? `Last sync: ${lastSyncTime.toLocaleTimeString()}`
    : 'Connecting…';

  return (
    <header className="flex justify-between items-center h-16 px-4 md:px-8 bg-surface border-b border-outline-variant z-10 w-full">
      {/* Mobile: Menu + Brand */}
      <div className="flex items-center space-x-3 md:hidden">
        <button
          onClick={onMenuToggle}
          className="p-2 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            bolt
          </span>
        </div>
      </div>

      {/* Desktop: Title + Connection status */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant">
          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2">
            {isRealtime && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              error ? 'bg-red-500' : isRealtime ? 'bg-green-500' : isLoading ? 'bg-amber-400' : 'bg-amber-400'
            }`}></span>
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-on-surface-variant">
            {error ? 'Error' : isRealtime ? 'LIVE' : isLoading ? 'Connecting' : 'Polling'}
          </span>
        </div>
      </div>

      {/* Mobile: Connection status */}
      <div className="flex items-center space-x-2 md:hidden">
        <span className="relative flex h-2 w-2">
          {isRealtime && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${
            error ? 'bg-red-500' : isRealtime ? 'bg-green-500' : 'bg-amber-400'
          }`}></span>
        </span>
      </div>

      {/* Right side actions */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Search Bar (hidden on small screens) */}
        <div className="relative hidden md:block group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] group-focus-within:text-primary transition-colors">
            search
          </span>
          <input
            className="pl-10 pr-4 py-1.5 rounded-full border border-outline-variant bg-surface-container-lowest text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-48 lg:w-64 placeholder-on-surface-variant/70"
            placeholder="Search devices..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Sync time */}
        <span className="text-[10px] text-on-surface-variant font-medium hidden lg:block tracking-wide uppercase">
          {syncLabel}
        </span>

        {/* Actions Container */}
        <div className="flex items-center gap-1 border-l border-outline-variant/50 pl-2 sm:pl-4 ml-1 sm:ml-2">
          
          {/* Dark Mode Toggle - Mobile visible */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-all duration-200 flex items-center justify-center"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-300 hover:rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Alerts Notification */}
          <button 
            onClick={() => navigate('/alerts')}
            className="relative p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">
              {unresolvedAlertsCount > 0 ? 'notifications_active' : 'notifications'}
            </span>
            {unresolvedAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-surface animate-pulse"></span>
            )}
          </button>

          <button 
            onClick={() => setHelpOpen(true)}
            className="hidden sm:flex p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors items-center justify-center"
          >
            <span className="material-symbols-outlined text-[20px]">help</span>
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="hidden sm:flex p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-full transition-colors items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
            
            {/* Settings Dropdown */}
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg py-2 z-50 animate-slide-in">
                <div className="px-4 py-2 border-b border-outline-variant/50 mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Preferences</h4>
                </div>
                <button 
                  onClick={toggleDarkMode}
                  className="w-full px-4 py-2 text-sm text-left text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                  </span>
                  <div className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${darkMode ? 'bg-primary' : 'bg-surface-container-highest'}`}>
                    <div className={`w-3 h-3 bg-surface rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </button>
                <button onClick={() => setSettingsOpen(false)} className="w-full px-4 py-2 text-sm text-left text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 mt-1">
                  <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-surface rounded-xl max-w-md w-full border border-outline-variant shadow-2xl overflow-hidden animate-slide-in">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">support_agent</span>
                  Help & Support
                </h3>
                <button onClick={() => setHelpOpen(false)} className="text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <p className="text-sm text-on-surface mb-4">
                Welcome to the <b>SmartMeter Pro</b> safety dashboard. This system monitors real-time temperature and smoke levels across all your connected ESP32 devices.
              </p>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex gap-2 items-start"><span className="material-symbols-outlined text-red-500 text-[18px]">crisis_alert</span> <b>Critical Danger:</b> Temp {'>'} 75°C or Smoke {'>'} 1000</li>
                <li className="flex gap-2 items-start"><span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span> <b>Warning Level:</b> Temp {'>'} 60°C or Smoke {'>'} 850</li>
                <li className="flex gap-2 items-start"><span className="material-symbols-outlined text-primary text-[18px]">monitoring</span> <b>Live Data:</b> Updates every second automatically.</li>
              </ul>
            </div>
            <div className="bg-surface-container-low px-6 py-4 flex justify-end">
              <button onClick={() => setHelpOpen(false)} className="px-4 py-2 bg-primary text-on-primary rounded text-sm font-semibold hover:bg-primary-container transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
