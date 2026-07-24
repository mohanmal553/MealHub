import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { Loader2 } from 'lucide-react';

const AppContent = () => {
  const { user, loading, isMaintenanceMode } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#0f172a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <span className="text-xs font-semibold text-slate-400">Loading MealHub Console...</span>
        </div>
      </div>
    );
  }

  // 1. Unauthenticated visitors ALWAYS see the Login Page first
  if (!user) {
    return <Login />;
  }

  // 2. After login: Non-admin users see Maintenance Screen if Maintenance Mode is turned ON
  if (isMaintenanceMode && user.role !== 'admin') {
    return <MaintenanceScreen />;
  }

  const isAdmin = user.role === 'admin';

  // 3. Authenticated Admin or Active Member Dashboard View
  return (
    <div className="h-screen w-screen flex flex-col font-sans overflow-hidden bg-[var(--bg-main,#0f172a)] text-[var(--text-main,#f8fafc)] transition-colors duration-300">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Full-width responsive container */}
      <div className="flex-1 w-full px-3 py-3 md:px-6 md:py-4 flex flex-col md:flex-row gap-4 md:gap-6 overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 min-w-0 overflow-y-auto no-scrollbar pr-1 pb-6 relative z-10">
          {isAdmin ? (
            <AdminDashboard activeTab={activeTab} />
          ) : (
            <StudentDashboard activeTab={activeTab} />
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
