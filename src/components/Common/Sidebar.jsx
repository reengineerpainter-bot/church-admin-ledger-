import React, { useState } from 'react';
import { 
  Users, RotateCcw, Terminal, ChevronDown, ChevronUp, 
  LogOut, Download, Sun, Moon, TrendingUp, FileText, 
  AlertCircle, ShieldAlert, Award, Activity, Wallet, UserPlus
} from 'lucide-react';
import { UserAvatar } from './UserAvatar';

export function Sidebar({
  currentUser,
  authUserId,
  authUser,
  users,
  logs,
  onSwitchUser,
  onReset,
  onLogout,
  theme,
  onToggleTheme,
  activeModule,
  setActiveModule,
  pendingAuditsCount
}) {
  const [isProfileSwitcherOpen, setIsProfileSwitcherOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const getFormattedName = (u) => {
    if (!u) return '';
    const cleanName = u.name.replace(/^(Cell Leader|CL|Member)\s+/i, '');
    return `${u.title || 'Bro'} ${cleanName}`;
  };

  // Hierarchy role color badge
  const getRoleBadgeColor = (role) => {
    if (role === 'admin') return 'badge-amber-soft';
    if (role === 'group_pastor') return 'badge-slate-soft';
    if (role === 'pastor') return 'badge-slate-soft';
    if (role === 'chapter_leader') return 'badge-emerald-soft';
    if (role === 'cell_leader') return 'badge-cyan-soft';
    return 'badge-indigo-soft';
  };

  const getRoleLabel = (role) => {
    if (role === 'admin') return 'Zonal Pastor (L1)';
    if (role === 'group_pastor') return 'Group Pastor (L2)';
    if (role === 'pastor') return 'Pastor (L3)';
    if (role === 'chapter_leader') return 'Chapter Leader (L4)';
    if (role === 'cell_leader') return 'Cell Leader (L5)';
    return 'Member (L6)';
  };

  // Group visible users for the switcher dropdown
  const getVisibleUsers = () => {
    if (!authUser || authUserId === 'logged_out') return { admin: [], cl: [], cell: [], member: [] };
    const role = authUser.role;

    if (role === 'admin' || role === 'group_pastor' || role === 'pastor') {
      return {
        admin: users.filter(u => (u.role === 'admin' || u.role === 'group_pastor' || u.role === 'pastor') && u.status === 'Active'),
        cl: users.filter(u => u.role === 'chapter_leader' && u.status === 'Active'),
        cell: users.filter(u => u.role === 'cell_leader' && u.status === 'Active'),
        member: users.filter(u => u.role === 'member' && u.status === 'Active')
      };
    }

    if (role === 'chapter_leader') {
      return {
        admin: [],
        cl: users.filter(u => u.id === authUser.id),
        cell: users.filter(u => u.role === 'cell_leader' && u.chapterId === authUser.chapterId && u.status === 'Active'),
        member: users.filter(u => u.role === 'member' && u.chapterId === authUser.chapterId && u.status === 'Active')
      };
    }

    if (role === 'cell_leader') {
      return {
        admin: [],
        cl: [],
        cell: users.filter(u => u.id === authUser.id),
        member: users.filter(u => u.role === 'member' && u.cellId === authUser.cellId && u.status === 'Active')
      };
    }

    return {
      admin: [],
      cl: [],
      cell: [],
      member: users.filter(u => u.id === authUser.id)
    };
  };

  const visibleUsers = getVisibleUsers();
  const adminUsers = visibleUsers.admin || [];
  const clUsers = visibleUsers.cl || [];
  const cellUsers = visibleUsers.cell || [];
  const memberUsers = visibleUsers.member || [];

  const handleDownloadLogs = () => {
    const text = logs.map(log => `[${log.time}] > ${log.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `system_audit_logs_${Date.now()}.txt`;
    link.click();
  };

  // Dynamic nav items configuration
  const getNavItems = () => {
    if (!currentUser) return [];
    const role = currentUser.role;

    const items = [
      { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
      { id: 'ledger', label: 'Ledger Register', icon: FileText },
      { id: 'personal_givings', label: 'My Personal Givings', icon: Wallet }
    ];

    if (role !== 'member') {
      items.push({ id: 'access_control', label: 'Access Control', icon: UserPlus });
    }

    items.push({ id: 'souls', label: 'Soul Tracker', icon: Award });

    if (role !== 'member') {
      items.push({ id: 'deficits', label: 'Deficit Reports', icon: AlertCircle });
      items.push({ id: 'audits', label: 'Audits', icon: ShieldAlert, badge: pendingAuditsCount });
    }

    return items;
  };

  const navItems = getNavItems();

  // Theme border style based on role
  const getThemeClass = (role) => {
    if (role === 'admin') return 'theme-level1';
    if (role === 'chapter_leader') return 'theme-level4';
    if (role === 'cell_leader') return 'theme-level5';
    return 'theme-level6';
  };

  return (
    <aside className={`w-80 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 h-screen sticky top-0 shrink-0 select-none z-40 transition-all ${currentUser ? getThemeClass(currentUser.role) : ''}`}>
      {/* Brand logo header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-650 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-900/50 font-sans">
          ⛪
        </div>
        <div>
          <span className="font-extrabold text-base text-slate-100 tracking-tight block">Church Admin</span>
          <span className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase block -mt-1">Ledger Hierarchy</span>
        </div>
      </div>

      {/* 1. Context Switcher (Simulate Profile) */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-2 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider mb-2 px-1">
          <Users size={12} />
          <span>Simulate Operational Tier</span>
        </div>

        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setIsProfileSwitcherOpen(!isProfileSwitcherOpen)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] custom-focus cursor-pointer"
            >
              <div className="flex items-center gap-2 text-left truncate">
                <UserAvatar user={currentUser} size="xs" className="shrink-0" />
                <div className="flex flex-col truncate">
                  <span className="font-bold text-slate-200 truncate text-xs">{getFormattedName(currentUser)}</span>
                  <span className="text-[9px] text-slate-500 font-bold -mt-0.5">{getRoleLabel(currentUser.role)}</span>
                </div>
              </div>
              {isProfileSwitcherOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
            </button>

            {isProfileSwitcherOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileSwitcherOpen(false)} />
                <div className="absolute right-0 left-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto animate-dropdown">
                  
                  {/* Pastors (L1 - L3) */}
                  {adminUsers.length > 0 && (
                    <div className="p-1 border-b border-slate-850 bg-slate-900/20">
                      <span className="text-[9px] text-slate-500 font-extrabold tracking-wider uppercase px-2.5 py-1 block">Pastors (L1 - L3)</span>
                      {adminUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => { onSwitchUser(u.id); setIsProfileSwitcherOpen(false); }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${currentUser?.id === u.id ? 'bg-indigo-650 text-white font-extrabold' : 'text-slate-455 hover:bg-slate-900 hover:text-slate-200'}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <UserAvatar user={u} size="xs" className="shrink-0" />
                            <span className="truncate">{getFormattedName(u)}</span>
                          </div>
                          <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold shrink-0">{getRoleLabel(u.role)}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chapter Leaders */}
                  {clUsers.length > 0 && (
                    <div className="p-1 border-b border-slate-850">
                      <span className="text-[9px] text-slate-500 font-extrabold tracking-wider uppercase px-2.5 py-1 block">Chapter Leaders (Level 4)</span>
                      {clUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => { onSwitchUser(u.id); setIsProfileSwitcherOpen(false); }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${currentUser?.id === u.id ? 'bg-indigo-650 text-white' : 'text-slate-455 hover:bg-slate-900 hover:text-slate-200'}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <UserAvatar user={u} size="xs" className="shrink-0" />
                            <span className="truncate">{getFormattedName(u)}</span>
                          </div>
                          <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold shrink-0">{u.chapterId ? `Ch ${u.chapterId.toUpperCase()}` : 'N/A'}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cell Leaders */}
                  {cellUsers.length > 0 && (
                    <div className="p-1 border-b border-slate-850">
                      <span className="text-[9px] text-slate-500 font-extrabold tracking-wider uppercase px-2.5 py-1 block">Cell Leaders (Level 5)</span>
                      {cellUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => { onSwitchUser(u.id); setIsProfileSwitcherOpen(false); }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${currentUser?.id === u.id ? 'bg-indigo-650 text-white' : 'text-slate-455 hover:bg-slate-900 hover:text-slate-200'}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <UserAvatar user={u} size="xs" className="shrink-0" />
                            <span className="truncate">{getFormattedName(u)}</span>
                          </div>
                          <span className="text-[8px] px-1 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold shrink-0">{u.cellId ? `Cell ${u.cellId.toUpperCase()}` : 'N/A'}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Members */}
                  {memberUsers.length > 0 && (
                    <div className="p-1">
                      <span className="text-[9px] text-slate-500 font-extrabold tracking-wider uppercase px-2.5 py-1 block">Members (Level 6)</span>
                      {memberUsers.map(u => (
                        <button
                          key={u.id}
                          onClick={() => { onSwitchUser(u.id); setIsProfileSwitcherOpen(false); }}
                          className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between cursor-pointer ${currentUser?.id === u.id ? 'bg-indigo-650 text-white' : 'text-slate-455 hover:bg-slate-900 hover:text-slate-200'}`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <UserAvatar user={u} size="xs" className="shrink-0" />
                            <span className="truncate">{getFormattedName(u)}</span>
                          </div>
                          <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold shrink-0">{u.cellId ? `Cell ${u.cellId.toUpperCase()}` : 'N/A'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-[10px] bg-slate-950 border border-slate-850 px-3 py-1.5 rounded-xl text-slate-500 font-bold uppercase tracking-wider select-none flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping shrink-0" />
            No Simulated Profile Active
          </div>
        )}
      </div>

      {/* 2. Core Operational Modules */}
      <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider px-2.5 mb-2.5">
          Operational Core
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-none cursor-pointer active:scale-[0.98] ${isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{item.label}</span>
              </div>
              {item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full font-extrabold font-mono text-[9px] animate-pulse-soft ${isActive ? 'bg-white text-indigo-700' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3. System logs / Console Drawer */}
      <div className="border-t border-slate-800 bg-slate-950/30 flex flex-col shrink-0">
        <button
          onClick={() => setShowLogs(!showLogs)}
          className={`flex items-center justify-between px-6 py-3.5 text-xs font-bold transition-colors border-none cursor-pointer ${showLogs ? 'text-indigo-400 bg-slate-950/60' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'}`}
        >
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-slate-500" />
            <span>Audit Console</span>
          </div>
          {logs.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse-soft" />
          )}
        </button>

        {showLogs && (
          <div className="h-44 border-t border-slate-800 bg-slate-950/80 p-3 font-mono text-[10px] overflow-y-auto flex flex-col gap-1.5 shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 mb-1.5 shrink-0">
              <span className="text-slate-550 font-bold uppercase tracking-wider flex items-center gap-1">
                <Activity size={10} className="text-indigo-400" /> System Logs
              </span>
              <button
                onClick={handleDownloadLogs}
                className="text-indigo-400 hover:text-indigo-300 font-bold uppercase text-[9px] flex items-center gap-1 transition-colors bg-transparent border-none cursor-pointer"
              >
                <Download size={9} /> TXT
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-1">
                  <span className="text-slate-655 shrink-0 font-bold">[{log.time}]</span>
                  <span className="text-slate-300">{log.text}</span>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-slate-600 italic text-center py-4">No logged actions recorded yet.</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Settings, Theme Switcher & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2.5 shrink-0">
        <button
          onClick={onToggleTheme}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-405 hover:text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
          title="Toggle UI Color Scheme"
        >
          {theme === 'dark' ? (
            <>
              <Sun size={13} className="text-amber-500" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={13} className="text-indigo-400" />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          title="Reset All Simulation States"
        >
          <RotateCcw size={14} />
        </button>

        {currentUser && (
          <button
            onClick={onLogout}
            className="p-2 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            title="Terminate Simulated Session"
          >
            <LogOut size={14} />
          </button>
        )}
      </div>
    </aside>
  );
}
export default Sidebar;
