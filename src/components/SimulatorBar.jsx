import React, { useState } from 'react';
import { Users, Shield, RotateCcw, Activity, Terminal, ChevronDown, ChevronUp, User, LogOut } from 'lucide-react';
import { EditUserModal } from './Common/EditUserModal';

export function SimulatorBar({ currentUser, users, logs, onSwitchUser, onReset, updateUser, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  // Group users by role with hierarchical visibility constraints:
  const getVisibleUsers = () => {
    if (!currentUser) return { admin: [], cl: [], cell: [], member: [] };

    const role = currentUser.role;

    if (role === 'admin') {
      // Pastor sees everyone
      return {
        admin: users.filter(u => u.role === 'admin' && u.status === 'Active'),
        cl: users.filter(u => u.role === 'chapter_leader' && u.status === 'Active'),
        cell: users.filter(u => u.role === 'cell_leader' && u.status === 'Active'),
        member: users.filter(u => u.role === 'member' && u.status === 'Active')
      };
    }

    if (role === 'chapter_leader') {
      // Chapter Leader sees only themselves, cell leaders in their chapter, and members in their chapter
      return {
        admin: [],
        cl: users.filter(u => u.id === currentUser.id),
        cell: users.filter(u => u.role === 'cell_leader' && u.chapterId === currentUser.chapterId && u.status === 'Active'),
        member: users.filter(u => u.role === 'member' && u.chapterId === currentUser.chapterId && u.status === 'Active')
      };
    }

    if (role === 'cell_leader') {
      // Cell Leader sees only themselves and members in their cell group
      return {
        admin: [],
        cl: [],
        cell: users.filter(u => u.id === currentUser.id),
        member: users.filter(u => u.role === 'member' && u.cellId === currentUser.cellId && u.status === 'Active')
      };
    }

    if (role === 'member') {
      // Members see only themselves
      return {
        admin: [],
        cl: [],
        cell: [],
        member: users.filter(u => u.id === currentUser.id)
      };
    }

    return { admin: [], cl: [], cell: [], member: [] };
  };

  const visibleUsers = getVisibleUsers();
  const adminUsers = visibleUsers.admin;
  const clUsers = visibleUsers.cl;
  const cellUsers = visibleUsers.cell;
  const memberUsers = visibleUsers.member;

  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (role === 'chapter_leader') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (role === 'cell_leader') return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Pastor / Admin';
    if (role === 'chapter_leader') return 'Chapter Leader';
    if (role === 'cell_leader') return 'Cell Leader';
    return 'Registered Member';
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-900/50">
              ⛪
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-100 tracking-tight">The <span className="text-indigo-400">Haven</span></span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-semibold tracking-widest uppercase">Admin & Ledger</span>
            </div>
          </div>

          {/* Quick toggle logs for mobile */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-indigo-400"
                title="Edit Profile"
              >
                <User size={18} />
              </button>
            )}
            {currentUser && (
              <button
                onClick={onLogout}
                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-rose-400"
                title="Log Out Session"
              >
                <LogOut size={18} />
              </button>
            )}
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200"
              title="Show Audit Logs"
            >
              <Terminal size={18} />
            </button>
            <button
              onClick={onReset}
              className="p-2 bg-slate-950 border border-slate-850 rounded-xl text-slate-400 hover:text-red-400"
              title="Reset Simulation"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Profile Selector Panel */}
        {currentUser ? (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold shrink-0">
              <Users size={16} className="text-slate-500" />
              <span>Simulate Profile:</span>
            </div>

            <div className="relative flex-grow sm:flex-grow-0">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full sm:w-72 flex items-center justify-between gap-3 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-sm font-medium transition-all shadow-inner"
              >
                <div className="flex items-center gap-2 text-left truncate">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="font-bold truncate">{currentUser.name}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border uppercase font-extrabold shrink-0 ${getRoleBadgeColor(currentUser.role)}`}>
                    {currentUser.role === 'admin' ? 'Pastor' : currentUser.role.replace('_', ' ')}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>

              {isOpen && (
                <div className="absolute right-0 left-0 mt-2 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
                {adminUsers.length > 0 && (
                  <div className="p-2 border-b border-slate-850 bg-slate-900/40">
                    <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase px-2 py-1 block">Pastor (Root Authority)</span>
                    {adminUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { onSwitchUser(u.id); setIsOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between ${currentUser?.id === u.id ? 'bg-indigo-650 text-white' : 'text-slate-350 hover:bg-slate-900 hover:text-slate-100'}`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[9px] opacity-70">Global Access</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Chapter Leaders */}
                {clUsers.length > 0 && (
                  <div className="p-2 border-b border-slate-850">
                    <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase px-2 py-1 block">Chapter Leaders (Regional)</span>
                    {clUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { onSwitchUser(u.id); setIsOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between ${currentUser?.id === u.id ? 'bg-indigo-650 text-white' : 'text-slate-350 hover:bg-slate-900 hover:text-slate-100'}`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900 font-bold">Chapter {u.chapterId.toUpperCase()}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Cell Leaders */}
                {cellUsers.length > 0 && (
                  <div className="p-2 border-b border-slate-850">
                    <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase px-2 py-1 block">Cell Leaders (Micro)</span>
                    {cellUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { onSwitchUser(u.id); setIsOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between ${currentUser?.id === u.id ? 'bg-indigo-650 text-white' : 'text-slate-350 hover:bg-slate-900 hover:text-slate-100'}`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-900 font-bold">{u.cellId}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Registered Members */}
                {memberUsers.length > 0 && (
                  <div className="p-2">
                    <span className="text-[10px] text-slate-500 font-extrabold tracking-wider uppercase px-2 py-1 block">Registered Members (Personal)</span>
                    {memberUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => { onSwitchUser(u.id); setIsOpen(false); }}
                        className={`w-full text-left px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-between ${currentUser?.id === u.id ? 'bg-indigo-650 text-white' : 'text-slate-350 hover:bg-slate-900 hover:text-slate-100'}`}
                      >
                        <span>{u.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-900 font-bold">{u.cellId}</span>
                      </button>
                    ))}
                  </div>
                )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-xs bg-slate-950 border border-slate-850 px-4 py-2 rounded-xl text-slate-500 font-bold uppercase tracking-wider select-none animate-pulse-soft flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping inline-block" />
            Interactive Authentication Simulation Active
          </div>
        )}

          {/* Desktop utility buttons */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser && (
              <button
                onClick={() => setShowEditProfile(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-indigo-500/25 hover:text-indigo-400 rounded-xl text-xs text-slate-400 font-bold transition-all"
              >
                <User size={14} />
                Edit Profile
              </button>
            )}

            <button
              onClick={() => setShowLogs(!showLogs)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-bold transition-colors ${showLogs ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <Terminal size={14} />
              Audit Logs
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-850 hover:border-red-500/20 hover:text-red-400 rounded-xl text-xs text-slate-400 font-bold transition-all"
            >
              <RotateCcw size={14} />
              Reset State
            </button>

            {currentUser && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all"
              >
                <LogOut size={14} />
                Log Out
              </button>
            )}
          </div>
        </div>

        {/* Expanded Logs Drawer */}
      {showLogs && (
        <div className="bg-slate-950 border-t border-slate-800 max-h-48 overflow-y-auto px-4 py-3 font-mono text-[11px]">
          <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-slate-850 mb-1">
              <span className="text-slate-400 font-extrabold flex items-center gap-1">
                <Activity size={12} className="text-indigo-400 animate-pulse-soft" />
                SYSTEM AUDIT LOGS (CREDENTIALS & FINANCIAL ACTIONS)
              </span>
              <button onClick={() => setShowLogs(false)} className="text-slate-500 hover:text-slate-350 font-bold uppercase text-[9px]">Close</button>
            </div>
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2">
                <span className="text-slate-600 font-bold shrink-0">[{log.time}]</span>
                <span className="text-indigo-300 font-bold select-none">&gt;</span>
                <span className="text-slate-300 font-medium">{log.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {currentUser && (
        <EditUserModal
          isOpen={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          user={currentUser}
          onSave={updateUser}
          isAdminMode={false}
        />
      )}
    </div>
  );
}
export default SimulatorBar;
