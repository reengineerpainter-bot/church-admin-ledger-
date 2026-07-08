import React from 'react';
import { useAppState } from './hooks/useAppState';
import { SimulatorBar } from './components/SimulatorBar';
import { AdminPortal } from './components/Portals/AdminPortal';
import { ChapterPortal } from './components/Portals/ChapterPortal';
import { CellPortal } from './components/Portals/CellPortal';
import { MemberPortal } from './components/Portals/MemberPortal';
import { ShieldAlert, LogIn, Lock } from 'lucide-react';
import { LoginScreen } from './components/Common/LoginScreen';

export function App() {
  const state = useAppState();
  const { currentUser, currentUserId } = state;

  // Render correct dashboard depending on role and approval status
  const renderDashboard = () => {
    if (currentUserId === 'logged_out') {
      return <LoginScreen onLogin={state.login} users={state.users} />;
    }

    if (!currentUser) return null;

    // If simulated user is pending approval
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
            &gt;_ To activate these credentials, use the simulator bar at the top to log in as the approving authority, navigate to the verification queues, and click "Confirm".
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
            The credential credentials for <strong className="text-slate-250">@{currentUser.username}</strong> have been rejected by the administrator tier above them.
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
      {/* Dynamic top profile switcher */}
      <SimulatorBar
        currentUser={currentUser}
        users={state.users}
        logs={state.logs}
        onSwitchUser={state.switchUser}
        onReset={state.resetData}
        updateUser={state.updateUser}
        onLogout={state.logout}
      />

      <main className="max-w-7xl mx-auto px-4 mt-6">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default App;
