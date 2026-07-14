import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import GlobalToaster from './GlobalToaster';
import { SupabaseDataProvider } from '../context/SupabaseDataContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SupabaseDataProvider>
      <GlobalToaster />
      <div className="bg-surface text-on-surface antialiased min-h-screen flex font-body-md">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full md:w-[calc(100%-16rem)]">
          <TopNav onMenuToggle={() => setSidebarOpen(true)} />
          
          <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-surface-container-low">
            <Outlet />
          </main>
        </div>
      </div>
    </SupabaseDataProvider>
  );
}
