import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { AboutDeveloperModal } from './AboutDeveloperModal';
import { 
  LayoutDashboard, 
  Utensils, 
  Receipt, 
  Users, 
  History,
  Code2
} from 'lucide-react';

export const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  // Navigation Tabs
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'meals', label: 'Meal Matrix', icon: Utensils },
    { id: 'expenses', label: 'Expenses Log', icon: Receipt },
    { id: 'students', label: 'Member Directory', icon: Users },
    { id: 'history', label: 'History', icon: History },
    { id: 'about', label: 'About Developer', icon: Code2 },
  ];

  const handleNavClick = (id) => {
    if (id === 'about') {
      setIsAboutModalOpen(true);
    } else {
      setActiveTab(id);
    }
  };

  return (
    <>
      <aside className="w-full md:w-64 glass-panel flex-shrink-0 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between no-scrollbar md:h-full md:overflow-y-auto relative z-30">
        <div>
          <div className="mb-2 px-1 flex items-center justify-between">
            <span className="text-[9px] md:text-[10px] font-black tracking-widest text-slate-500 uppercase">
              {isAdmin ? 'Management Console' : 'Member Portal'}
            </span>
          </div>
          
          {/* Navigation Bar */}
          <nav className="flex md:flex-col gap-2 p-1 overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2.5 whitespace-nowrap px-3.5 py-2.5 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 font-extrabold md:translate-x-1'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:translate-x-0.5'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* About Developer Modal */}
      <AboutDeveloperModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />
    </>
  );
};
