import React, { useState, useEffect } from 'react';
import { useAppState } from './hooks/useAppState';
import { Sidebar } from './components/Common/Sidebar';
import { Topbar } from './components/Common/Topbar';
import { AdminPortal } from './components/Portals/AdminPortal';
import { ChapterPortal } from './components/Portals/ChapterPortal';
import { CellPortal } from './components/Portals/CellPortal';
import { MemberPortal } from './components/Portals/MemberPortal';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import { LoginScreen } from './components/Common/LoginScreen';

export function App() {
  const state = useAppState();
  const { currentUser, currentUserId, logout } = state;
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-mode');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-mode');
      root.classList.add('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Auto logout after 3 minutes of inactivity
  useEffect(() => {
    if (currentUserId === 'logged_out') return;

    const TIMEOUT_DURATION = 3 * 60 * 1000; // 3 minutes
    let inactivityTimer;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        logout();
      }, TIMEOUT_DURATION);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

    // Initialize timer
    resetTimer();

    // Attach listeners
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [currentUserId, logout]);

  // Reset active module when current user profile changes
  useEffect(() => {
    setActiveModule('dashboard');
    setGlobalSearchTerm('');
  }, [currentUserId]);

  // Calculate pending verifications count for topbar notifications and sidebar badge
  const getPendingAuditsCount = () => {
    if (!currentUser || currentUserId === 'logged_out') return 0;

    switch (currentUser.role) {
      case 'admin': {
        const pendingCellLeaders = state.users.filter(
          u => u.role === 'cell_leader' && u.status === 'Pending_Higher_Approval'
        );
        const pendingDeletions = state.users.filter(u => u.status === 'Pending_Deletion');
        const pendingSouls = state.souls.filter(s => {
          if (s.status !== 'Pending_Approval') return false;
          const reporter = state.users.find(u => u.id === s.recordedBy);
          return reporter && reporter.role === 'chapter_leader';
        });
        const pendingGivings = state.ledger.filter(item => {
          if (item.status !== 'Pending_Cell_Review') return false;
          const reporter = state.users.find(u => u.id === item.memberId);
          return reporter && reporter.role === 'chapter_leader';
        });
        return pendingCellLeaders.length + pendingDeletions.length + pendingSouls.length + pendingGivings.length;
      }
      case 'chapter_leader': {
        const pendingMembers = state.users.filter(
          u => u.chapterId === currentUser.chapterId && u.status === 'Pending_Higher_Approval'
        );
        const pendingSouls = state.souls.filter(s => {
          if (s.status !== 'Pending_Approval') return false;
          const reporter = state.users.find(u => u.id === s.recordedBy);
          return reporter && reporter.role === 'member' && reporter.chapterId === currentUser.chapterId;
        });
        const pendingGivings = state.ledger.filter(item => {
          if (item.status !== 'Pending_Cell_Review') return false;
          const reporter = state.users.find(u => u.id === item.memberId);
          return reporter && reporter.role === 'cell_leader' && reporter.chapterId === currentUser.chapterId;
        });
        return pendingMembers.length + pendingSouls.length + pendingGivings.length;
      }
      case 'cell_leader': {
        const cellLedger = state.ledger.filter(item => item.cellId === currentUser.cellId);
        const pendingSubmissions = cellLedger.filter(item => item.status === 'Pending_Cell_Review');
        const pendingSouls = state.souls.filter(s => {
          if (s.status !== 'Pending_Approval') return false;
          const reporter = state.users.find(u => u.id === s.recordedBy);
          return reporter && reporter.role === 'member' && reporter.cellId === currentUser.cellId;
        });
        return pendingSubmissions.length + pendingSouls.length;
      }
      case 'member': {
        const mySubmissions = state.ledger.filter(item => item.memberId === currentUser.id);
        const pendingSubmissions = mySubmissions.filter(item => item.status === 'Pending_Cell_Review');
        return pendingSubmissions.length;
      }
      default:
        return 0;
    }
  };

  const pendingAuditsCount = getPendingAuditsCount();

  // Render correct dashboard depending on role and approval status
  const renderDashboard = () => {
    if (!currentUser) return null;

    // Simulated user is pending approval
    if (currentUser.status === 'Pending_Higher_Approval') {
      const creator = state.users.find(u => u.id === currentUser.creatorId);
      const isCellLeader = currentUser.role === 'cell_leader';
      const approverRoleName = isCellLeader ? 'Pastor (Global Root)' : 'Chapter Leader (Regional)';

      return (
        <div className="max-w-2xl mx-auto my-12 p-8 bg-slate-900 border border-amber-500/20 rounded-3xl text-center flex flex-col items-center gap-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse-soft">
            <Lock size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">Credentials Pending Approval</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Your simulated login credentials for <strong className="text-slate-200">@{currentUser.username} ({currentUser.name})</strong> are currently in a <span className="text-amber-400 font-bold">Pending Confirmation</span> state.
          </p>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 w-full text-xs text-left space-y-2 mt-2">
            <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Two-Tier Workflow Hierarchy:</div>
            <div>&bull; User created by: <strong className="text-indigo-400">{creator?.name || 'Administrator'}</strong></div>
            <div>&bull; Higher Approval Tier: <strong className="text-indigo-400">{approverRoleName}</strong></div>
          </div>
          <div className="text-xs text-amber-400 bg-amber-550/5 border border-amber-500/10 px-4 py-3 rounded-xl mt-4 leading-relaxed font-semibold">
            &gt;_ To activate these credentials, use the simulator sidebar on the left to log in as the approving authority, navigate to the "Audits" console, and click "Confirm".
          </div>
        </div>
      );
    }

    if (currentUser.status === 'Rejected') {
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-rose-500/20 rounded-3xl text-center flex flex-col items-center gap-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-100 uppercase tracking-wide">Credentials Rejected</h2>
          <p className="text-sm text-slate-400">
            The credentials for <strong className="text-slate-250">@{currentUser.username}</strong> have been rejected by the administrator tier above them.
          </p>
        </div>
      );
    }

    // Role switcher dashboard router
    switch (currentUser.role) {
      case 'admin':
        return (
          <AdminPortal
            currentUser={currentUser}
            users={state.users}
            ledger={state.ledger}
            chapters={state.chapters}
            cells={state.cells}
            createCredential={state.createCredential}
            approveCredential={state.approveCredential}
            rejectCredential={state.rejectCredential}
            createChapter={state.createChapter}
            updateUser={state.updateUser}
            approveUserDeletion={state.approveUserDeletion}
            rejectUserDeletion={state.rejectUserDeletion}
            submitSoulRecord={state.submitSoulRecord}
            approveSoul={state.approveSoul}
            rejectSoul={state.rejectSoul}
            submitLedgerEntry={state.submitLedgerEntry}
            verifyLedgerEntry={state.verifyLedgerEntry}
            souls={state.souls}
            onEditProfile={() => setShowEditProfile(true)}
            activeModule={activeModule}
            globalSearchTerm={globalSearchTerm}
          />
        );
      case 'chapter_leader':
        return (
          <ChapterPortal
            currentUser={currentUser}
            users={state.users}
            ledger={state.ledger}
            chapters={state.chapters}
            cells={state.cells}
            createCredential={state.createCredential}
            approveCredential={state.approveCredential}
            rejectCredential={state.rejectCredential}
            createCell={state.createCell}
            updateUser={state.updateUser}
            requestUserDeletion={state.requestUserDeletion}
            submitSoulRecord={state.submitSoulRecord}
            approveSoul={state.approveSoul}
            rejectSoul={state.rejectSoul}
            submitLedgerEntry={state.submitLedgerEntry}
            verifyLedgerEntry={state.verifyLedgerEntry}
            souls={state.souls}
            onEditProfile={() => setShowEditProfile(true)}
            activeModule={activeModule}
            globalSearchTerm={globalSearchTerm}
          />
        );
      case 'cell_leader':
        return (
          <CellPortal
            currentUser={currentUser}
            users={state.users}
            ledger={state.ledger}
            chapters={state.chapters}
            cells={state.cells}
            createCredential={state.createCredential}
            verifyLedgerEntry={state.verifyLedgerEntry}
            updateUser={state.updateUser}
            submitSoulRecord={state.submitSoulRecord}
            approveSoul={state.approveSoul}
            rejectSoul={state.rejectSoul}
            submitLedgerEntry={state.submitLedgerEntry}
            souls={state.souls}
            onEditProfile={() => setShowEditProfile(true)}
            activeModule={activeModule}
            globalSearchTerm={globalSearchTerm}
          />
        );
      case 'member':
        return (
          <MemberPortal
            currentUser={currentUser}
            ledger={state.ledger}
            chapters={state.chapters}
            cells={state.cells}
            submitLedgerEntry={state.submitLedgerEntry}
            updateUser={state.updateUser}
            submitSoulRecord={state.submitSoulRecord}
            souls={state.souls}
            onEditProfile={() => setShowEditProfile(true)}
            activeModule={activeModule}
            globalSearchTerm={globalSearchTerm}
          />
        );
      default:
        return (
          <div className="text-center py-20 text-slate-400">
            Invalid role session configured.
          </div>
        );
    }
  };

  if (currentUserId === 'logged_out') {
    return <LoginScreen onLogin={state.login} users={state.users} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100">
      {/* 1. Left Sidebar with Simulator Controls */}
      <Sidebar
        currentUser={currentUser}
        authUserId={state.authUserId}
        authUser={state.authUser}
        users={state.users}
        logs={state.logs}
        onSwitchUser={state.switchUser}
        onReset={state.resetData}
        onLogout={state.logout}
        theme={theme}
        onToggleTheme={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        pendingAuditsCount={pendingAuditsCount}
      />

      {/* 2. Top Bar and Main Workspace Viewport */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Topbar
          currentUser={currentUser}
          globalSearchTerm={globalSearchTerm}
          setGlobalSearchTerm={setGlobalSearchTerm}
          pendingAuditsCount={pendingAuditsCount}
          setActiveModule={setActiveModule}
          onLogout={state.logout}
          onEditProfile={() => setShowEditProfile(true)}
        />

        <main className="flex-grow p-6">
          {renderDashboard()}
        </main>
      </div>
    </div>
  );
}

export default App;
