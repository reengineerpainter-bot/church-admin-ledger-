import React, { useState } from 'react';
import { Search, Bell, LogOut, User, Sparkles } from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export function Topbar({
  currentUser,
  globalSearchTerm,
  setGlobalSearchTerm,
  pendingAuditsCount,
  setActiveModule,
  onLogout,
  onEditProfile
}) {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Zonal Pastor (L1)';
    if (role === 'chapter_leader') return 'Chapter Leader (L4)';
    if (role === 'cell_leader') return 'Cell Leader (L5)';
    return 'Member (L6)';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 select-none shrink-0 shadow-sm shadow-slate-950/20">
      
      {/* 1. Global Search Box */}
      <div className="flex-1 max-w-md relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-505" />
        <input
          type="text"
          placeholder="Global search by transactions, members, chapters..."
          value={globalSearchTerm}
          onChange={(e) => setGlobalSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-955 border border-slate-800 custom-focus text-slate-105 rounded-xl text-xs outline-none transition-all placeholder:text-slate-600"
        />
      </div>

      {/* 2. Right Actions: Notification Bell + User Avatar Dropdown */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button
          onClick={() => setActiveModule('audits')}
          className="relative p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer border-none"
          title={`View Pending Audits (${pendingAuditsCount} Awaiting)`}
        >
          <Bell size={18} />
          {pendingAuditsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-650 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-slate-900 animate-pulse-soft font-mono">
              {pendingAuditsCount}
            </span>
          )}
        </button>

        {/* User Profile dropdown */}
        {currentUser && (
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-800/40 rounded-xl transition-all cursor-pointer border-none"
            >
              <UserAvatar user={currentUser} size="sm" className="ring-2 ring-indigo-500/10" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200">{currentUser.name}</span>
                <span className="text-[9px] text-slate-500 -mt-0.5">{getRoleLabel(currentUser.role)}</span>
              </div>
            </button>

            {showProfileDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileDropdown(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5">
                  <div className="px-4 py-2 border-b border-slate-850">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Operational Profile</span>
                    <span className="text-xs font-bold text-slate-200 mt-1 block">@{currentUser.username}</span>
                  </div>

                  <button
                    onClick={() => {
                      onEditProfile();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-305 hover:bg-slate-900 hover:text-slate-100 flex items-center gap-2.5 transition-colors border-none cursor-pointer"
                  >
                    <User size={13} className="text-slate-500" />
                    Edit Profile Details
                  </button>

                  <button
                    onClick={() => {
                      setActiveModule('dashboard');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-slate-100 flex items-center gap-2.5 transition-colors border-none cursor-pointer"
                  >
                    <Sparkles size={13} className="text-slate-500" />
                    My Dashboard Core
                  </button>

                  <div className="border-t border-slate-850 my-1.5" />

                  <button
                    onClick={() => {
                      onLogout();
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-455 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors border-none cursor-pointer"
                  >
                    <LogOut size={13} className="text-rose-400" />
                    Terminate Session
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
export default Topbar;
