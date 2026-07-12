import React, { useState } from 'react';
import { StatCard } from '../Common/StatCard';
import { LineChart, BarChart } from '../Common/SvgCharts';
import { CredentialForm } from './CredentialForm';
import { UserDirectory } from './UserDirectory';
import { 
  TrendingUp, Users, Grid, CheckCircle, XCircle, 
  UserPlus, UserCheck, AlertTriangle, ShieldCheck, Plus, Sparkles, AlertCircle, Calendar, FileText, Camera
} from 'lucide-react';
import { RecordGivingForm } from '../Common/RecordGivingForm';
import { RecordSoulForm } from '../Common/RecordSoulForm';
import { TimeframeFilter } from '../Common/TimeframeFilter';
import { UserAvatar } from '../Common/UserAvatar';

export function ChapterPortal({ 
  currentUser, 
  users, 
  ledger, 
  chapters, 
  cells, 
  createCredential, 
  approveCredential, 
  rejectCredential,
  createCell,
  updateUser,
  requestUserDeletion,
  submitSoulRecord,
  approveSoul,
  rejectSoul,
  submitLedgerEntry,
  verifyLedgerEntry,
  souls,
  onEditProfile
}) {
  const [showAddLeader, setShowAddLeader] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' or 'directory'
  const [newCellName, setNewCellName] = useState('');
  const [cellSuccess, setCellSuccess] = useState(false);
  const [revealedReport, setRevealedReport] = useState(null); // 'givings' | 'souls' | 'cells' | 'members' | null
  const [timeframe, setTimeframe] = useState('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filterByTimeframe = (dateStr) => {
    if (!dateStr) return false;
    const itemDate = new Date(dateStr);
    const now = new Date();
    
    itemDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (timeframe === 'custom') {
      if (!customStart || !customEnd) return true;
      const start = new Date(customStart);
      const end = new Date(customEnd);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return itemDate >= start && itemDate <= end;
    }
    
    const diffTime = now.getTime() - itemDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (diffDays < 0) return true; // future dates
    
    switch (timeframe) {
      case 'weekly':
        return diffDays <= 7;
      case 'monthly':
        return diffDays <= 30;
      case 'quarterly':
        return diffDays <= 90;
      case 'half_year':
        return diffDays <= 180;
      case 'full_year':
        return diffDays <= 365;
      default:
        return true;
    }
  };

  // --- EXPORT UTILITIES ---
  const exportToTxt = (title, headers, rows) => {
    let text = `${title.toUpperCase()}\n`;
    text += `${'='.repeat(title.length)}\n\n`;
    const widths = headers.map((h, i) => {
      const colValues = rows.map(r => String(r[i] || ''));
      return Math.max(h.length, ...colValues.map(v => v.length));
    });
    text += headers.map((h, i) => h.padEnd(widths[i] + 3)).join('') + '\n';
    text += widths.map(w => '-'.repeat(w + 3)).join('') + '\n';
    rows.forEach(row => {
      text += row.map((val, i) => String(val || '').padEnd(widths[i] + 3)).join('') + '\n';
    });
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_report.txt`;
    link.click();
  };

  const exportToWord = (title, headers, rows) => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><meta charset="utf-8"><title>${title}</title>`;
    html += `<style>body {font-family: Arial, sans-serif;} h2 {color: #3b82f6;} table {width: 100%; border-collapse: collapse; margin-top: 20px;} th, td {border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 12px;} th {background-color: #f3f4f6; font-weight: bold;}</style>`;
    html += `</head><body>`;
    html += `<h2>${title}</h2>`;
    html += `<p>Generated on: ${new Date().toLocaleString()}</p>`;
    html += `<table><thead><tr>`;
    headers.forEach(h => {
      html += `<th>${h}</th>`;
    });
    html += `</tr></thead><tbody>`;
    rows.forEach(row => {
      html += `<tr>`;
      row.forEach(val => {
        html += `<td>${val || ''}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table></body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_report.doc`;
    link.click();
  };

  const triggerPrint = (title, headers, rows) => {
    const printWindow = window.open('', '_blank');
    let html = `<html><head><title>${title}</title>`;
    html += `<style>body {font-family: system-ui, -apple-system, sans-serif; padding: 30px; color: #1e293b;} h2 {color: #4f46e5; margin-bottom: 5px;} .meta {font-size: 11px; color: #64748b; margin-bottom: 25px;} table {width: 100%; border-collapse: collapse;} th, td {border: 1px solid #e2e8f0; padding: 10px; text-align: left; font-size: 12px;} th {background-color: #f8fafc; color: #475569; font-weight: bold;} tr:nth-child(even) {background-color: #f8fafc;}</style>`;
    html += `</head><body>`;
    html += `<h2>${title}</h2>`;
    html += `<div class="meta">Church ADMIN & LEDGER Administration | Generated: ${new Date().toLocaleString()}</div>`;
    html += `<table><thead><tr>`;
    headers.forEach(h => {
      html += `<th>${h}</th>`;
    });
    html += `</tr></thead><tbody>`;
    rows.forEach(row => {
      html += `<tr>`;
      row.forEach(val => {
        html += `<td>${val || ''}</td>`;
      });
      html += `</tr>`;
    });
    html += `</tbody></table>`;
    html += `<script>window.onload = function() { window.print(); window.close(); }</script>`;
    html += `</body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const chapterId = currentUser.chapterId;
  const chapterName = chapters.find(ch => ch.id === chapterId)?.name || 'Unknown Chapter';

  // --- REGIONAL FILTERING ---
  const chapterCells = cells.filter(c => c.chapterId === chapterId);
  const chapterUsers = users.filter(u => u.chapterId === chapterId);
  const chapterLedger = ledger.filter(item => item.chapterId === chapterId);
  const confirmedLedger = chapterLedger.filter(item => item.status === 'Confirmed');

  // --- STATS COMPUTATIONS ---
  const confirmedLedgerFiltered = confirmedLedger.filter(item => filterByTimeframe(item.serviceDate));
  
  const totalChapterGiving = confirmedLedgerFiltered.reduce((sum, item) => sum + item.totalAmount, 0);
  
  const soulsFiltered = souls.filter(s => s.status === 'Approved' && s.chapterId === chapterId && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const totalChapterSouls = confirmedLedgerFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + soulsFiltered.length;

  // --- PERSONAL METRICS COMPUTATIONS ---
  const mySubmissions = ledger.filter(item => item.memberId === currentUser.id);
  const myConfirmed = mySubmissions.filter(item => item.status === 'Confirmed');
  const mySubmissionsFiltered = mySubmissions.filter(item => filterByTimeframe(item.serviceDate));
  const myConfirmedFiltered = myConfirmed.filter(item => filterByTimeframe(item.serviceDate));

  const myPersonalGiving = myConfirmedFiltered.reduce((sum, item) => sum + (item.amount || item.totalAmount || 0), 0);

  const mySouls = souls.filter(s => s.recordedBy === currentUser.id);
  const mySoulsFiltered = mySouls.filter(s => s.status === 'Approved' && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const myPersonalSouls = myConfirmedFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + mySoulsFiltered.length;

  const myPersonalSubmissions = mySubmissionsFiltered.length;
  
  const activeCellLeadersCount = chapterUsers.filter(u => u.role === 'cell_leader' && u.status === 'Active').length;
  const activeMembersCount = chapterUsers.filter(u => u.role === 'member' && u.status === 'Active').length;

  // Evaluate underperforming cell groups inside this chapter
  const cellGroups = cells.filter(c => c.chapterId === chapterId);
  const nonPerformingCells = cellGroups.filter(cell => {
    const cellGiving = confirmedLedgerFiltered
      .filter(item => item.cellId === cell.id)
      .reduce((sum, item) => sum + item.totalAmount, 0);
    
    const cellSouls = confirmedLedgerFiltered
      .filter(item => item.cellId === cell.id)
      .reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + 
      soulsFiltered.filter(s => s.cellId === cell.id).length;
    
    return cellGiving === 0 && cellSouls === 0;
  });

  // --- CHART DATA ---
  // 1. Weekly Giving trend for this chapter
  const weeklyTotalsMap = {};
  confirmedLedger.forEach(item => {
    weeklyTotalsMap[item.serviceDate] = (weeklyTotalsMap[item.serviceDate] || 0) + item.totalAmount;
  });
  const weeklyGivingData = Object.keys(weeklyTotalsMap)
    .sort()
    .map(date => {
      const d = new Date(date);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return { label, value: weeklyTotalsMap[date] };
    });

  // 2. Cell Performance Breakdown
  const cellGivingMap = {};
  chapterCells.forEach(cell => {
    cellGivingMap[cell.id] = 0;
  });
  confirmedLedger.forEach(item => {
    if (cellGivingMap[item.cellId] !== undefined) {
      cellGivingMap[item.cellId] += item.totalAmount;
    }
  });
  const cellGivingData = chapterCells.map(cell => ({
    label: cell.name,
    value: cellGivingMap[cell.id]
  }));

  // --- CELL ASSESSMENT PANEL ---
  const latestDate = '2026-07-05';
  
  const cellAssessments = chapterCells.map(cell => {
    const hasSubmission = chapterLedger.some(item => item.cellId === cell.id && item.serviceDate === latestDate);
    const cellGiving = chapterLedger
      .filter(item => item.cellId === cell.id && item.status === 'Confirmed')
      .reduce((sum, item) => sum + item.totalAmount, 0);
    const cellSouls = chapterLedger
      .filter(item => item.cellId === cell.id && item.status === 'Confirmed')
      .reduce((sum, item) => sum + item.newMembersBroughtIn, 0);

    let classification = 'High Performer';
    let alerts = [];

    if (!hasSubmission) {
      classification = 'Deficit Alert';
      alerts.push('Missed Reporting Deadline');
    }
    if (cellGiving < 150 && cell.leaderName !== 'Vacant') {
      classification = 'Deficit Alert';
      alerts.push('Low Giving (Under $150)');
    }
    if (cell.leaderName === 'Vacant') {
      classification = 'Deficit Alert';
      alerts.push('Leadership Vacancy');
    }

    // High Performer condition (if not flagged as deficit and has healthy metrics)
    if (classification !== 'Deficit Alert' && (cellGiving >= 300 || cellSouls >= 2)) {
      classification = 'High Performer';
    } else if (classification !== 'Deficit Alert') {
      classification = 'Stable';
    }

    return {
      cellId: cell.id,
      name: cell.name,
      leader: cell.leaderName,
      classification,
      alerts,
      giving: cellGiving,
      souls: cellSouls
    };
  });

  const highPerformers = cellAssessments.filter(c => c.classification === 'High Performer');
  const deficitAlerts = cellAssessments.filter(c => c.classification === 'Deficit Alert');

  const pendingMembers = users.filter(u => 
    u.role === 'member' && 
    u.chapterId === chapterId && 
    u.status === 'Pending_Higher_Approval'
  );

  // Souls pending approval under this Chapter Leader
  const pendingSouls = souls.filter(s => {
    if (s.status !== 'Pending_Approval') return false;
    if (s.chapterId !== chapterId) return false;

    const reporter = users.find(u => u.id === s.recordedBy);
    if (!reporter) return false;

    if (reporter.role === 'cell_leader') return true;
    if (reporter.role === 'member') {
      const hasCellLeader = users.some(u => u.role === 'cell_leader' && u.cellId === reporter.cellId && u.status === 'Active');
      return !hasCellLeader;
    }
    return false;
  });

  // Giving entries from Cell Leaders pending audit
  const pendingGivings = ledger.filter(item => {
    if (item.status !== 'Pending_Cell_Review') return false;
    if (item.chapterId !== chapterId) return false;

    const reporter = users.find(u => u.id === item.memberId);
    if (!reporter) return false;

    if (reporter.role === 'cell_leader') return true;
    if (reporter.role === 'member') {
      const hasCellLeader = users.some(u => u.role === 'cell_leader' && u.cellId === reporter.cellId && u.status === 'Active');
      return !hasCellLeader;
    }
    return false;
  });

  const handleCreateCell = (e) => {
    e.preventDefault();
    if (!newCellName.trim()) return;
    createCell(newCellName.trim(), chapterId, 'Vacant');
    setNewCellName('');
    setCellSuccess(true);
    setTimeout(() => setCellSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 border-t-2 border-emerald-500/70 rounded-t-3xl pt-2">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 glass-panel rounded-3xl">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onDoubleClick={onEditProfile}
            className="relative group rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all ring-4 ring-indigo-500/10 shrink-0 border-none cursor-pointer p-0"
            title="Double-click to Edit Profile"
          >
            <UserAvatar user={currentUser} size="lg" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera size={16} />
            </div>
          </button>
          <div>
            <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-wider">Chapter Leader Portal ({chapterName})</span>
            <h2 className="text-2xl font-extrabold text-slate-100 mt-1">Senior Care Group Administration</h2>
            <p className="text-slate-400 text-sm mt-1">Managing cells, auditing member credentials, and assessing local financial health.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onDoubleClick={() => setShowAddLeader(!showAddLeader)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/30 cursor-pointer border-none"
            title="Double-click to Provision Cell Leader"
          >
            <UserPlus size={14} />
            {showAddLeader ? 'View Dashboards' : 'Provision Cell Leader'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        <button
          onClick={() => { setActiveTab('dashboard'); setShowAddLeader(false); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-b-2 ${activeTab === 'dashboard' && !showAddLeader ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-205'}`}
        >
          Overview & Analytics
        </button>
        <button
          onClick={() => { setActiveTab('directory'); setShowAddLeader(false); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-b-2 ${activeTab === 'directory' ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-205'}`}
        >
          Credentials & Members Directory
        </button>
        <button
          onClick={() => { setActiveTab('personal'); setShowAddLeader(false); }}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border-b-2 ${activeTab === 'personal' ? 'text-indigo-400 border-indigo-500 bg-indigo-500/5' : 'text-slate-400 border-transparent hover:text-slate-205'}`}
        >
          My Personal Input
        </button>
      </div>

      {showAddLeader ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form to Create Cell Leader */}
          <div className="lg:col-span-2">
            <CredentialForm
              creatorRole={currentUser.role}
              targetRole="cell_leader"
              chapters={chapters}
              cells={cells}
              currentChapterId={chapterId}
              onSubmit={createCredential}
            />
          </div>

          {/* Quick Cell Group Creator */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-fit">
            <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Plus size={18} className="text-indigo-400" />
              Establish New Cell Group
            </h3>
            {cellSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
                Cell Group established successfully!
              </div>
            )}
            <form onSubmit={handleCreateCell} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Cell Group Name</label>
                <input
                  type="text"
                  placeholder="e.g. Hope Cell"
                  value={newCellName}
                  onChange={(e) => setNewCellName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Create Cell Group
              </button>
            </form>
          </div>
        </div>
      ) : activeTab === 'directory' ? (
        <UserDirectory
          currentUser={currentUser}
          users={users}
          chapters={chapters}
          cells={cells}
          updateUser={updateUser}
          requestUserDeletion={requestUserDeletion}
        />
      ) : activeTab === 'personal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecordGivingForm
            currentUser={currentUser}
            onSubmit={submitLedgerEntry}
            onUpdateUser={updateUser}
          />
          <RecordSoulForm
            currentUser={currentUser}
            chapters={chapters}
            cells={cells}
            onSubmit={submitSoulRecord}
          />
        </div>
      ) : (
        <>
          {/* Timeframe Filter for Metrics & Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 bg-slate-900/20 p-4 rounded-3xl border border-slate-850">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Chapter Overview & Analytics</h3>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Filter chapter regional statistics by period</p>
            </div>
            <TimeframeFilter 
              value={timeframe} 
              onChange={setTimeframe} 
              customStart={customStart}
              onChangeStart={setCustomStart}
              customEnd={customEnd}
              onChangeEnd={setCustomEnd}
            />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Chapter Total Giving"
              value={`$${totalChapterGiving.toLocaleString()}`}
              icon={TrendingUp}
              description={`Click to reveal giving contributors in ${chapterName}`}
              status="info"
              onClick={() => setRevealedReport('givings')}
            />
            <StatCard
              title="Chapter Souls Won"
              value={totalChapterSouls}
              icon={ShieldCheck}
              description="Click to reveal cell and individual soul-winning tallies"
              status="success"
              onClick={() => setRevealedReport('souls')}
            />
            <StatCard
              title="Active Cell Groups"
              value={chapterCells.length}
              icon={Grid}
              description="Click to reveal active cells and leaders list"
              status="default"
              onClick={() => setRevealedReport('cells')}
            />
            <StatCard
              title="Registered Members"
              value={activeMembersCount}
              icon={Users}
              description={`Click to reveal directory of scoped active members`}
              status="default"
              onClick={() => setRevealedReport('members')}
            />
          </div>

          {/* My Personal Overview */}
          <div className="p-4 sm:p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl mt-6">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2 animate-pulse-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              My Personal Overview & Analytics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="My Personal Giving"
                value={`$${myPersonalGiving.toLocaleString()}`}
                icon={TrendingUp}
                description="Your confirmed giving records for this timeframe"
                status="info"
              />
              <StatCard
                title="My Personal Outreach"
                value={`${myPersonalSouls} Souls`}
                icon={Sparkles}
                description="Approved souls won and brought by you"
                status="success"
              />
              <StatCard
                title="My Personal Submissions"
                value={`${myPersonalSubmissions} Entries`}
                icon={FileText}
                description="Your submitted entries in this timeframe"
                status="default"
              />
            </div>
          </div>

          {/* Member Credential Queue (Awaiting Chapter Leader Approval) */}
          {pendingMembers.length > 0 && (
            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2 mb-4">
                <UserCheck size={18} />
                Two-Tier Credential Queue: Pending Chapter Confirmation
              </h3>
              <div className="overflow-x-auto rounded-xl border border-amber-500/10 bg-slate-950/60">
                <table className="w-full border-collapse text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-amber-500/10 text-slate-400 uppercase tracking-wider font-extrabold bg-slate-900/60">
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Assigned Cell Group</th>
                      <th className="px-4 py-3">Creator (Cell Leader)</th>
                      <th className="px-4 py-3 font-mono">Temp Password</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10">
                    {pendingMembers.map(u => {
                      const creator = users.find(cUser => cUser.id === u.creatorId);
                      const cell = cells.find(c => c.id === u.cellId);
                      return (
                        <tr key={u.id} className="hover:bg-amber-500/5 transition-colors font-medium">
                          <td className="px-4 py-3 text-slate-100 font-bold">{u.name}</td>
                          <td className="px-4 py-3 text-slate-350">@{u.username}</td>
                          <td className="px-4 py-3 text-indigo-300 font-bold">{cell?.name}</td>
                          <td className="px-4 py-3 text-slate-400">{creator?.name || 'Unknown'}</td>
                          <td className="px-4 py-3 font-mono">{u.tempPassword}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveCredential(u.id)}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-1 active:scale-95"
                            >
                              <CheckCircle size={12} /> Confirm
                            </button>
                            <button
                              onClick={() => rejectCredential(u.id)}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-lg border border-rose-500/20 transition-colors flex items-center gap-1 active:scale-95"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Souls Pending Verification Queue */}
          {pendingSouls.length > 0 && (
            <div className="p-6 border border-indigo-500/15 bg-indigo-500/5 rounded-3xl mt-4">
              <h3 className="text-md font-bold text-indigo-400 flex items-center gap-2 mb-4">
                <Sparkles size={18} />
                Souls Awaiting Chapter Confirmation ({pendingSouls.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSouls.map(soul => (
                  <div key={soul.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3 font-medium">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{soul.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900">{soul.sex}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Recorded by: <span className="text-slate-400 font-semibold">{soul.reporterName}</span></p>
                      <div className="mt-2 text-xs space-y-1 text-slate-450 border-t border-slate-900 pt-2">
                        <p><span className="text-slate-500 font-medium">Profession:</span> {soul.profession}</p>
                        <p><span className="text-slate-500 font-medium">Phone:</span> {soul.phone}</p>
                        <p><span className="text-slate-500 font-medium">Address:</span> {soul.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-slate-900 pt-2.5">
                      <button
                        onClick={() => approveSoul(soul.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Confirm & Activate
                      </button>
                      <button
                        onClick={() => rejectSoul(soul.id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg text-[10px] transition-colors border border-rose-500/10"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapter Leader Giving Verification Queue */}
          {pendingGivings.length > 0 && (
            <div className="p-6 border border-amber-500/15 bg-amber-500/5 rounded-3xl mt-4">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2 mb-4">
                <AlertCircle size={18} />
                Financial Audit Queue: Pending Chapter Review ({pendingGivings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingGivings.map(item => (
                  <div key={item.id} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-100">{item.memberName}</span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                          <Calendar size={12} />
                          {item.serviceDate}
                        </span>
                      </div>
                      
                      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-900 mb-4 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Giving Segment:</span>
                          <span className="text-slate-205 font-bold">{item.segment || 'Local'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Category:</span>
                          <span className="text-indigo-400 font-bold">{item.category}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-900 pt-2 font-bold text-sm">
                          <span className="text-slate-300">Amount:</span>
                          <span className="text-emerald-400">${item.totalAmount}</span>
                        </div>
                        {item.description && (
                          <div className="border-t border-slate-900 pt-2">
                            <span className="text-slate-500 block font-semibold mb-1">Additional Description:</span>
                            <p className="text-slate-400 italic text-[11px] leading-relaxed">{item.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-slate-900 pt-3">
                      <button
                        onClick={() => verifyLedgerEntry(item.id, true)}
                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-colors"
                      >
                        Approve Receipt
                      </button>
                      <button
                        onClick={() => verifyLedgerEntry(item.id, false)}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold rounded-lg text-[10px] transition-colors border border-rose-500/10"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chapter Cell Groups Non-Performance Alerts */}
          <div className="p-6 border border-rose-500/10 bg-rose-500/5 rounded-3xl mt-6">
            <h3 className="text-md font-bold text-rose-450 flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              Non-Performance Flags: Chapter Cell Groups ({nonPerformingCells.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Fellowship cells inside this chapter flagged for zero total cell giving AND zero souls won within the selected timeframe.
            </p>
            {nonPerformingCells.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 text-center">
                All fellowship cells are performing actively. No flags generated.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonPerformingCells.map(cell => (
                  <div key={cell.id} className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-205 block">{cell.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Chapter: {chapterName}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-550/10 text-rose-400 border border-rose-500/10 rounded-lg text-[9px] font-bold uppercase tracking-wider animate-pulse">
                      Underperforming
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chapter Analytical Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 glass-panel rounded-3xl">
              <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" />
                Chapter Giving Trend
              </h3>
              <p className="text-xs text-slate-500 mb-4">Confirmed receipts generated inside {chapterName}.</p>
              <div className="h-60 flex items-center">
                <LineChart data={weeklyGivingData} strokeColor="#818cf8" />
              </div>
            </div>

            <div className="p-6 glass-panel rounded-3xl">
              <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Grid size={16} className="text-cyan-400" />
                Cell Giving Distribution
              </h3>
              <p className="text-xs text-slate-500 mb-4">Giving output split by individual cell groups.</p>
              <div className="h-60 flex items-center">
                <BarChart data={cellGivingData} barColor="#06b6d4" />
              </div>
            </div>
          </div>

          {/* Cell Assessment Panel (High Performers & Deficit Alerts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Performers */}
            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
              <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2 mb-2">
                <CheckCircle size={18} />
                Cell Assessment: High Performers
              </h3>
              <p className="text-xs text-slate-400 mb-4">Cell groups exceeding weekly giving targets of $300 or showing strong outreach growth.</p>
              
              {highPerformers.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-6 text-center">No cell group categorized as High Performer yet.</div>
              ) : (
                <div className="space-y-3">
                  {highPerformers.map(cell => (
                    <div key={cell.cellId} className="p-4 bg-slate-950/40 border border-emerald-500/20 rounded-2xl flex items-center justify-between hover:bg-slate-900/10 dark:hover:bg-slate-900/35 transition-all duration-200">
                      <div>
                        <div className="font-bold text-slate-200">{cell.name}</div>
                        <div className="text-[10px] text-slate-500 mt-1">Leader: {cell.leader}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-emerald-500 font-mono tabular-nums">Giving: ${cell.giving}</div>
                        <div className="text-[10px] text-indigo-400 font-extrabold mt-0.5 font-mono tabular-nums">Outreach: +{cell.souls} Souls</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deficit Alerts */}
            <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
              <h3 className="text-md font-bold text-rose-400 flex items-center gap-2 mb-2">
                <AlertTriangle size={18} className="animate-pulse" />
                Cell Assessment: Deficit Alerts
              </h3>
              <p className="text-xs text-slate-400 mb-4">Cells failing targets, vacant, or missing deadline reporting (latest: {latestDate}).</p>
              
              {deficitAlerts.length === 0 ? (
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle size={14} /> Zero deficit alerts! All cells are performing up to targets.
                </div>
              ) : (
                <div className="space-y-3">
                  {deficitAlerts.map(cell => (
                    <div key={cell.cellId} className="p-4 bg-slate-950/40 border border-rose-500/20 rounded-2xl hover:bg-slate-900/10 dark:hover:bg-slate-900/35 transition-all duration-200">
                      <div className="flex items-center justify-between font-bold mb-2">
                        <span className="text-slate-200">{cell.name}</span>
                        <span className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200/50 dark:text-rose-300 dark:bg-rose-950/40 dark:border-rose-900/30 px-2 py-0.5 rounded font-extrabold">DEFICIT</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mb-2">Leader: {cell.leader}</div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {cell.alerts.map((al, idx) => (
                          <span key={idx} className="text-[9px] font-bold bg-rose-50 text-rose-750 border border-rose-200/40 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 px-1.5 py-0.5 rounded-md font-mono">
                            {al}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-900/60 pt-2">
                        <span>Giving: <strong className="text-slate-200 font-mono tabular-nums">${cell.giving}</strong></span>
                        <span>Outreach: <strong className="text-slate-200 font-mono tabular-nums">+{cell.souls} souls</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Chapter Analytics Reveal Modal */}
      {revealedReport && (() => {
        let reportTitle = '';
        let headers = [];
        let rows = [];

        if (revealedReport === 'givings') {
          reportTitle = `${chapterName} Total Givings Audit Report`;
          headers = ['Cell Group', 'Member', 'Category', 'Segment', 'Method', 'Amount', 'Date & Time'];
          rows = [...confirmedLedger]
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .map(item => {
              const cellName = cells.find(c => c.id === item.cellId)?.name || 'Unknown';
              return [
                cellName,
                item.memberName,
                item.category || 'Tithe',
                item.segment || 'Local',
                item.paymentMethod,
                `$${item.totalAmount}`,
                new Date(item.createdAt).toLocaleString()
              ];
            });
        } else if (revealedReport === 'souls') {
          reportTitle = `${chapterName} Souls Won Outreach Report`;
          headers = ['Cell Group', 'Member', 'Souls Won', 'Date & Time'];
          rows = [...confirmedLedger]
            .filter(item => item.newMembersBroughtIn > 0)
            .sort((a, b) => b.newMembersBroughtIn - a.newMembersBroughtIn)
            .map(item => {
              const cellName = cells.find(c => c.id === item.cellId)?.name || 'Unknown';
              return [
                cellName,
                item.memberName,
                `+${item.newMembersBroughtIn}`,
                new Date(item.createdAt).toLocaleString()
              ];
            });
        } else if (revealedReport === 'cells') {
          reportTitle = `${chapterName} Active Cell Groups Scope Report`;
          headers = ['Cell Group Name', 'Leader Name', 'Current Member Base', 'Total Giving Contribution'];
          rows = chapterCells.map(cell => {
            const cellMembersCount = users.filter(u => u.cellId === cell.id && u.role === 'member' && u.status === 'Active').length;
            const cellGiving = confirmedLedger
              .filter(item => item.cellId === cell.id)
              .reduce((sum, item) => sum + item.totalAmount, 0);
            return { cell, cellMembersCount, cellGiving };
          })
          .sort((a, b) => b.cellGiving - a.cellGiving)
          .map(item => [
            item.cell.name,
            item.cell.leaderName || 'Vacant',
            item.cellMembersCount,
            `$${item.cellGiving}`
          ]);
        } else if (revealedReport === 'members') {
          reportTitle = `${chapterName} Active Membership Fellowship Report`;
          headers = ['Member Name', 'Username', 'Title', 'Cell Group', 'Status'];
          rows = chapterUsers
            .filter(u => u.role === 'member' && u.status === 'Active')
            .map(u => {
              const cellName = cells.find(c => c.id === u.cellId)?.name || 'None';
              return [
                u.name,
                `@${u.username}`,
                u.title || 'Bro',
                cellName,
                u.status
              ];
            });
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-850 bg-slate-900/10">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{reportTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Summary of regional contributors and growth breakdown</p>
                </div>
                <button
                  onClick={() => setRevealedReport(null)}
                  className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 shrink-0 text-lg font-bold"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-405 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                        {headers.map((h, i) => {
                          const isAmountHeader = h.toLowerCase().includes('amount') || h.toLowerCase().includes('souls') || h.toLowerCase().includes('giving') || h.toLowerCase().includes('contribution') || h.toLowerCase().includes('base');
                          return (
                            <th key={i} className={`px-6 py-3 ${isAmountHeader ? 'text-right' : ''}`}>{h}</th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-medium text-slate-300">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="ledger-row transition-colors">
                          {row.map((val, cIdx) => {
                            const isNumeric = typeof val === 'string' && (val.startsWith('$') || val.startsWith('+') || /^\d+$/.test(val));
                            return (
                              <td 
                                key={cIdx} 
                                className={`px-6 py-3 ${isNumeric ? 'font-mono tabular-nums text-right text-indigo-400 font-bold' : ''}`}
                              >
                                {val}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {rows.length === 0 && (
                        <tr>
                          <td colSpan={headers.length} className="text-center py-8 text-slate-500 italic">No entries found for this report.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer controls with download formats */}
              <div className="flex items-center justify-between p-6 border-t border-slate-850 bg-slate-950/20">
                <div className="text-[10px] text-slate-550 font-semibold uppercase">Export Format Options:</div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => exportToTxt(reportTitle, headers, rows)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all"
                  >
                    Download TXT
                  </button>
                  <button
                    onClick={() => exportToWord(reportTitle, headers, rows)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-355 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all"
                  >
                    Download Word (.doc)
                  </button>
                  <button
                    onClick={() => triggerPrint(reportTitle, headers, rows)}
                    className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md shadow-indigo-900/20"
                  >
                    Print / Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
export default ChapterPortal;
