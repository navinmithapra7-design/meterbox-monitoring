import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSupabase } from '../context/SupabaseDataContext';

const monitoringItems = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/monitoring', label: 'Live Monitoring', icon: 'monitoring' },
];

const managementItems = [
  { path: '/alerts', label: 'Alert Management', icon: 'notifications' },
  { path: '/devices', label: 'Device Fleet', icon: 'settings_input_antenna' },
  { path: '/reports', label: 'Reports & Analysis', icon: 'analytics' },
];

const adminItems = [
  { path: '/admin', label: 'Admin Panel', icon: 'admin_panel_settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { alerts } = useSupabase();
  const unresolvedAlertsCount = alerts.filter(a => !a.is_resolved).length;

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <nav
        className={`
          h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface
          flex flex-col py-6 px-4 z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="mb-8 flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div>
            <h1 className="text-[17px] font-bold text-primary leading-tight tracking-tight">SmartMeter Pro</h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5">
              Govt. Electrical Dept.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Section 1: Monitoring */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-4 mb-2">Monitoring</h3>
            <ul className="flex flex-col space-y-1">
              {monitoringItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                        isActive
                          ? 'bg-primary text-on-primary font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary font-medium'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: Management */}
          <div className="mb-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-4 mb-2">Management</h3>
            <ul className="flex flex-col space-y-1">
              {managementItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                        isActive
                          ? 'bg-primary text-on-primary font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary font-medium'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center space-x-3">
                          <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        {item.path === '/alerts' && unresolvedAlertsCount > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-white text-primary' : 'bg-red-500 text-white'
                          }`}>
                            {unresolvedAlertsCount}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Administration */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-4 mb-2">Administration</h3>
            <ul className="flex flex-col space-y-1">
              {adminItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ease-in-out ${
                        isActive
                          ? 'bg-primary text-on-primary font-semibold shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary font-medium'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className="material-symbols-outlined text-[20px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer: Dark Mode Toggle + User */}
        <div className="mt-4 pt-4 border-t border-outline-variant px-2 space-y-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container-high transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-12" style={{ fontVariationSettings: "'FILL' 1" }}>
                {darkMode ? 'light_mode' : 'dark_mode'}
              </span>
              <span className="font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </div>
            <div className={`w-10 h-5 rounded-full flex items-center px-0.5 transition-colors duration-300 ${darkMode ? 'bg-primary' : 'bg-surface-container-highest'}`}>
              <div className={`w-4 h-4 bg-surface rounded-full shadow-sm transition-transform duration-300 ${darkMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
          </button>

          {/* User Info */}
          <div className="flex items-center space-x-3 px-2 py-2">
            <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border border-outline-variant">
              <span className="material-symbols-outlined text-sm font-bold">admin_panel_settings</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-primary truncate">System Admin</span>
              <span className="text-[10px] text-on-surface-variant">Govt. Access</span>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
