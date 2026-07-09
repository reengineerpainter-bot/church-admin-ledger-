import React, { useState } from 'react';
import { StatCard } from '../Common/StatCard';
import { LineChart, DonutChart, BarChart } from '../Common/SvgCharts';
import { CredentialForm } from './CredentialForm';
import { UserDirectory } from './UserDirectory';
import { 
  TrendingUp, Users, Map, Grid, CheckCircle, XCircle, 
  UserPlus, UserCheck, AlertTriangle, Trophy, Calendar, Sparkles, AlertCircle, FileText, Camera
} from 'lucide-react';
import { RecordGivingForm } from '../Common/RecordGivingForm';
import { RecordSoulForm } from '../Common/RecordSoulForm';
import { TimeframeFilter } from '../Common/TimeframeFilter';
import { UserAvatar } from '../Common/UserAvatar';

export function AdminPortal({ 
  currentUser, 
  users, 
  ledger, 
  chapters, 
  cells, 
  createCredential, 
  approveCredential, 
  rejectCredential,
  createChapter,
  updateUser,
  approveUserDeletion,
  rejectUserDeletion,
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
  const [newChapterName, setNewChapterName] = useState('');
  const [newChapterHq, setNewChapterHq] = useState('');
  const [chapterSuccess, setChapterSuccess] = useState(false);
  const [revealedReport, setRevealedReport] = useState(null); // 'givings' | 'souls' | 'chapters' | 'members' | null
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

  // --- STATS COMPUTATIONS ---
  // Confirmed entries
  const confirmedLedger = ledger.filter(item => item.status === 'Confirmed');
  
  // --- STATS COMPUTATIONS ---
  const confirmedLedgerFiltered = confirmedLedger.filter(item => filterByTimeframe(item.serviceDate));
  
  const totalGiving = confirmedLedgerFiltered.reduce((sum, item) => sum + item.totalAmount, 0);
  
  const soulsFiltered = souls.filter(s => s.status === 'Approved' && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const totalSoulsWon = confirmedLedgerFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + soulsFiltered.length;

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

  // Evaluate underperforming chapters
  const nonPerformingChapters = chapters.filter(chapter => {
    const chapterGiving = confirmedLedgerFiltered
      .filter(item => item.chapterId === chapter.id)
      .reduce((sum, item) => sum + item.totalAmount, 0);
    
    const chapterSouls = confirmedLedgerFiltered
      .filter(item => item.chapterId === chapter.id)
      .reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + 
      soulsFiltered.filter(s => s.chapterId === chapter.id).length;
    
    return chapterGiving === 0 && chapterSouls === 0;
  });

  // Active Users count
  const activeMembersCount = users.filter(u => u.role === 'member' && u.status === 'Active').length;
  const activeCellLeaders = users.filter(u => u.role === 'cell_leader' && u.status === 'Active').length;

  const pendingDeletions = users.filter(u => u.status === 'Pending_Deletion');

  // Souls pending approval under Pastor (Chapter Leaders' recorded souls)
  const pendingSouls = souls.filter(s => {
    if (s.status !== 'Pending_Approval') return false;
    const reporter = users.find(u => u.id === s.recordedBy);
    return reporter && reporter.role === 'chapter_leader';
  });

  // Giving entries from Chapter Leaders pending audit
  const pendingGivings = ledger.filter(item => {
    if (item.status !== 'Pending_Cell_Review') return false;
    const reporter = users.find(u => u.id === item.memberId);
    return reporter && reporter.role === 'chapter_leader';
  });

  // --- CHART DATA PREPARATION ---
  // 1. Weekly Giving trend
  const weeklyTotalsMap = {};
  confirmedLedger.forEach(item => {
    weeklyTotalsMap[item.serviceDate] = (weeklyTotalsMap[item.serviceDate] || 0) + item.totalAmount;
  });
  const weeklyGivingData = Object.keys(weeklyTotalsMap)
    .sort()
    .map(date => {
      // Shorten date to e.g. "Jun 14"
      const d = new Date(date);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return { label, value: weeklyTotalsMap[date] };
    });

  // 2. Giving type breakdown
  let breakdownTotals = {
    tithe: 0,
    offering: 0,
    partnership: 0,
    hosting: 0,
    pcoSeed: 0,
    welfare: 0,
    others: 0
  };
  confirmedLedger.forEach(item => {
    const cat = item.category ? item.category.toLowerCase() : '';
    const amt = item.amount || item.totalAmount || 0;
    if (cat === 'tithe') breakdownTotals.tithe += amt;
    else if (cat === 'offering') breakdownTotals.offering += amt;
    else if (cat === 'partnership') breakdownTotals.partnership += amt;
    else if (cat === 'church hosting') breakdownTotals.hosting += amt;
    else if (cat === 'pco seed') breakdownTotals.pcoSeed += amt;
    else if (cat === 'welfare') breakdownTotals.welfare += amt;
    else breakdownTotals.others += amt;
  });
  const givingTypeData = [
    { label: 'Tithe', value: breakdownTotals.tithe, color: '#6366f1' },
    { label: 'Offering', value: breakdownTotals.offering, color: '#10b981' },
    { label: 'Partnership', value: breakdownTotals.partnership, color: '#06b6d4' },
    { label: 'Church Hosting', value: breakdownTotals.hosting, color: '#3b82f6' },
    { label: 'PCO Seed', value: breakdownTotals.pcoSeed, color: '#8b5cf6' },
    { label: 'Welfare', value: breakdownTotals.welfare, color: '#f59e0b' },
    { label: 'Others', value: breakdownTotals.others, color: '#f43f5e' }
  ].filter(d => d.value > 0);

  // 3. Giving by Chapter
  const chapterGivingMap = {};
  chapters.forEach(ch => {
    chapterGivingMap[ch.id] = 0;
  });
  confirmedLedger.forEach(item => {
    if (chapterGivingMap[item.chapterId] !== undefined) {
      chapterGivingMap[item.chapterId] += item.totalAmount;
    }
  });
  const chapterGivingData = chapters.map(ch => ({
    label: ch.name,
    value: chapterGivingMap[ch.id]
  }));

  // --- LEADERBOARDS & METRICS ---
  // Soul-winning leaderboard by Cell
  const cellSoulsMap = {};
  cells.forEach(c => {
    cellSoulsMap[c.id] = { name: c.name, chapter: chapters.find(ch => ch.id === c.chapterId)?.name || 'Unknown', souls: 0 };
  });
  confirmedLedger.forEach(item => {
    if (cellSoulsMap[item.cellId]) {
      cellSoulsMap[item.cellId].souls += item.newMembersBroughtIn;
    }
  });
  const cellLeaderboard = Object.values(cellSoulsMap)
    .sort((a, b) => b.souls - a.souls);

  // --- CREDENTIALS WORKFLOW QUEUES ---
  // Cell Leaders created by Chapter Leaders awaiting Pastor's confirmation
  const pendingCellLeaders = users.filter(u => 
    u.role === 'cell_leader' && 
    u.status === 'Pending_Higher_Approval'
  );

  // Active leaders list
  const activeChapterLeadersList = users.filter(u => u.role === 'chapter_leader' && u.status === 'Active');
  const activeCellLeadersList = users.filter(u => u.role === 'cell_leader' && u.status === 'Active');

  // --- NON-PERFORMANCE FLAGGING SYSTEM ---
  // Highlight regions (cells) that have missed recent weekly reporting (e.g. 2026-07-05) OR have low attendance/giving growth
  const latestDate = '2026-07-05';
  
  const cellDeadlinesFlags = cells.map(cell => {
    // Check if cell submitted confirmed or pending entries for the latest reporting week
    const hasSubmission = ledger.some(item => item.cellId === cell.id && item.serviceDate === latestDate);
    // Calculate cell total giving
    const cellGiving = ledger
      .filter(item => item.cellId === cell.id && item.status === 'Confirmed')
      .reduce((sum, item) => sum + item.totalAmount, 0);

    const cellSouls = ledger
      .filter(item => item.cellId === cell.id && item.status === 'Confirmed')
      .reduce((sum, item) => sum + item.newMembersBroughtIn, 0);

    let performanceStatus = 'optimal';
    let flagReasons = [];

    if (!hasSubmission) {
      performanceStatus = 'critical';
      flagReasons.push('Missed Reporting Deadline');
    }
    if (cellGiving < 200 && cell.leaderName !== 'Vacant') {
      if (performanceStatus !== 'critical') performanceStatus = 'warning';
      flagReasons.push('Low Giving (Under $200)');
    }
    if (cellSouls === 0 && cell.leaderName !== 'Vacant') {
      if (performanceStatus !== 'critical') performanceStatus = 'warning';
      flagReasons.push('No Soul-Winning Growth');
    }
    if (cell.leaderName === 'Vacant') {
      performanceStatus = 'critical';
      flagReasons.push('Leadership Vacancy');
    }

    return {
      cellName: cell.name,
      chapterName: chapters.find(ch => ch.id === cell.chapterId)?.name || 'Unknown',
      leaderName: cell.leaderName,
      status: performanceStatus,
      reasons: flagReasons,
      giving: cellGiving,
      souls: cellSouls
    };
  }).filter(c => c.status !== 'optimal');

  const handleCreateChapter = (e) => {
    e.preventDefault();
    if (!newChapterName.trim() || !newChapterHq.trim()) return;
    createChapter(newChapterName.trim(), newChapterHq.trim());
    setNewChapterName('');
    setNewChapterHq('');
    setChapterSuccess(true);
    setTimeout(() => setChapterSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 glass-panel rounded-3xl">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onEditProfile}
            className="relative group rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all ring-4 ring-indigo-500/10 shrink-0 border-none cursor-pointer p-0"
            title="Click to Edit Profile"
          >
            <UserAvatar user={currentUser} size="lg" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera size={16} />
            </div>
          </button>
          <div>
            <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-wider">Pastor Portal</span>
            <h2 className="text-2xl font-extrabold text-slate-100 mt-1">Global Root Administration</h2>
            <p className="text-slate-400 text-sm mt-1">Full structural oversight of all chapters, cells, members, and giving receipts.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setShowAddLeader(!showAddLeader)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/30 cursor-pointer border-none"
          >
            <UserPlus size={14} />
            {showAddLeader ? 'View Dashboards' : 'Provision Chapter Leader'}
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
          Credentials & User Directory
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
          {/* Form to Create Chapter Leader */}
          <div className="lg:col-span-2">
            <CredentialForm
              creatorRole={currentUser.role}
              targetRole="chapter_leader"
              chapters={chapters}
              onSubmit={createCredential}
            />
          </div>

          {/* Form to Create Chapter */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 p-6 rounded-2xl h-fit">
            <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Map size={18} className="text-indigo-400" />
              Establish New Chapter
            </h3>
            {chapterSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl">
                Chapter established successfully!
              </div>
            )}
            <form onSubmit={handleCreateChapter} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Chapter Name</label>
                <input
                  type="text"
                  placeholder="e.g. Faith Chapter"
                  value={newChapterName}
                  onChange={(e) => setNewChapterName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Headquarters City</label>
                <input
                  type="text"
                  placeholder="e.g. New York"
                  value={newChapterHq}
                  onChange={(e) => setNewChapterHq(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-100 rounded-xl text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xs transition-colors"
              >
                Create Chapter
              </button>
            </form>
          </div>
        </div>
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
      ) : activeTab === 'directory' ? (
        <UserDirectory
          currentUser={currentUser}
          users={users}
          chapters={chapters}
          cells={cells}
          updateUser={updateUser}
        />
      ) : (
        <>
          {/* Timeframe Filter for Metrics & Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 bg-slate-900/20 p-4 rounded-3xl border border-slate-850">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Global Overview & Analytics</h3>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Filter entire church network statistics by period</p>
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

          {/* Metric Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Global Total Giving"
              value={`$${totalGiving.toLocaleString()}`}
              icon={TrendingUp}
              description="Click to reveal breakdown of chapter, cell, and member giving contributions"
              status="info"
              onClick={() => setRevealedReport('givings')}
            />
            <StatCard
              title="Total Souls Won"
              value={totalSoulsWon}
              icon={Trophy}
              description="Click to reveal cell group and individual soul-winning tallies"
              status="success"
              onClick={() => setRevealedReport('souls')}
            />
            <StatCard
              title="Active Chapters"
              value={chapters.length}
              icon={Map}
              description="Click to reveal regional headquarters details and leadership"
              status="default"
              onClick={() => setRevealedReport('chapters')}
            />
            <StatCard
              title="Active Member Base"
              value={activeMembersCount}
              icon={Users}
              description={`Click to reveal full database list of active members`}
              status="default"
              onClick={() => setRevealedReport('members')}
            />
          </div>

          {/* My Personal Overview */}
          <div className="p-4 sm:p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl mt-6">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2 animate-pulse-soft">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              My Personal Overview & Analytics (Pastor)
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

          {/* Credential Approvals Queue */}
          {pendingCellLeaders.length > 0 && (
            <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2 mb-4">
                <UserCheck size={18} />
                Two-Tier Credential Queue: Pending Pastor Confirmation
              </h3>
              <div className="overflow-x-auto rounded-xl border border-amber-500/10 bg-slate-950/60">
                <table className="w-full border-collapse text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-amber-500/10 text-slate-400 uppercase tracking-wider font-extrabold bg-slate-900/60">
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Assigned Region</th>
                      <th className="px-4 py-3">Creator (Chapter Leader)</th>
                      <th className="px-4 py-3">Temp Password</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-500/10">
                    {pendingCellLeaders.map(u => {
                      const creator = users.find(creatorUser => creatorUser.id === u.creatorId);
                      const chapter = chapters.find(ch => ch.id === u.chapterId);
                      const cell = cells.find(c => c.id === u.cellId);
                      return (
                        <tr key={u.id} className="hover:bg-amber-500/5 transition-colors font-medium">
                          <td className="px-4 py-3 text-slate-100 font-bold">{u.name}</td>
                          <td className="px-4 py-3 text-slate-300">@{u.username}</td>
                          <td className="px-4 py-3">
                            <span className="text-indigo-400">{chapter?.name}</span> &rarr; <span className="text-cyan-400">{cell?.name}</span>
                          </td>
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

          {/* Pending Deletions Queue */}
          {pendingDeletions.length > 0 && (
            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl mt-4">
              <h3 className="text-md font-bold text-rose-400 flex items-center gap-2 mb-4">
                <AlertTriangle size={18} className="animate-pulse" />
                Pending Deletion Approval Requests (Initiated by Chapter Leaders)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-rose-500/10 bg-slate-950/60">
                <table className="w-full border-collapse text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-rose-500/10 text-slate-400 uppercase tracking-wider font-extrabold bg-slate-900/60">
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Region / Scope</th>
                      <th className="px-4 py-3">Creator / Scope Authority</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-500/10">
                    {pendingDeletions.map(u => {
                      const creator = users.find(cUser => cUser.id === u.creatorId);
                      const chapter = chapters.find(ch => ch.id === u.chapterId);
                      const cell = cells.find(c => c.id === u.cellId);
                      return (
                        <tr key={u.id} className="hover:bg-rose-500/5 transition-colors font-medium">
                          <td className="px-4 py-3 text-slate-100 font-bold">{u.name}</td>
                          <td className="px-4 py-3 text-slate-350">@{u.username}</td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 uppercase text-[9px] font-bold">
                              {u.role.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {chapter?.name} {cell ? ` -> ${cell.name}` : ''}
                          </td>
                          <td className="px-4 py-3 text-slate-400">{creator?.name || 'Chapter Authority'}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveUserDeletion(u.id)}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-1 active:scale-95"
                            >
                              <CheckCircle size={12} /> Confirm Delete
                            </button>
                            <button
                              onClick={() => rejectUserDeletion(u.id)}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold rounded-lg border border-rose-500/20 transition-colors flex items-center gap-1 active:scale-95"
                            >
                              <XCircle size={12} /> Reject Request
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
                Souls Awaiting Pastor Confirmation ({pendingSouls.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSouls.map(soul => (
                  <div key={soul.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3 font-medium">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{soul.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900">{soul.sex}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Recorded by: <span className="text-slate-400 font-semibold">{soul.reporterName}</span> (Chapter Leader)</p>
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

          {/* Pastor Giving Verification Queue */}
          {pendingGivings.length > 0 && (
            <div className="p-6 border border-amber-500/15 bg-amber-500/5 rounded-3xl mt-4">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2 mb-4">
                <AlertCircle size={18} />
                Financial Audit Queue: Pending Pastor Review ({pendingGivings.length})
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

          {/* Chapters Non-Performance Alerts */}
          <div className="p-6 border border-rose-500/10 bg-rose-500/5 rounded-3xl mt-6">
            <h3 className="text-md font-bold text-rose-450 flex items-center gap-2 mb-2">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              Non-Performance Flags: Chapters ({nonPerformingChapters.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Regional chapters flagged for zero total chapter giving AND zero souls won within the selected timeframe.
            </p>
            {nonPerformingChapters.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 text-center">
                All regional chapters are performing actively. No flags generated.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonPerformingChapters.map(chapter => (
                  <div key={chapter.id} className="p-4 bg-slate-950/80 border border-slate-850 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-205 block">{chapter.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">HQ: {chapter.hq || 'Global HQ'}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-550/10 text-rose-400 border border-rose-500/10 rounded-lg text-[9px] font-bold uppercase tracking-wider animate-pulse">
                      Underperforming
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Weekly trend */}
            <div className="lg:col-span-2 p-6 glass-panel rounded-3xl">
              <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" />
                Global Weekly Giving Trends
              </h3>
              <p className="text-xs text-slate-500 mb-4">Confirmed receipts aggregated by service dates.</p>
              <div className="h-60 flex items-center">
                <LineChart data={weeklyGivingData} />
              </div>
            </div>

            {/* Right: Giving type breakdown */}
            <div className="p-6 glass-panel rounded-3xl">
              <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Grid size={16} className="text-pink-400" />
                Contribution Breakdown
              </h3>
              <p className="text-xs text-slate-500 mb-4">Category allocation of received funds.</p>
              <div className="h-60 flex items-center justify-center">
                <DonutChart data={givingTypeData} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Giving by Chapter */}
            <div className="p-6 glass-panel rounded-3xl">
              <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Map size={16} className="text-cyan-400" />
                Giving Receipts by Regional Chapter
              </h3>
              <p className="text-xs text-slate-500 mb-4">Regional performance based on audit confirmed transactions.</p>
              <div className="h-60 flex items-center">
                <BarChart data={chapterGivingData} barColor="#06b6d4" />
              </div>
            </div>

            {/* Right: Soul-Winning Leaderboard */}
            <div className="p-6 glass-panel rounded-3xl flex flex-col justify-between">
              <div>
                <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <Trophy size={16} className="text-yellow-500" />
                  Cell Group Soul-Winning Leaderboard
                </h3>
                <p className="text-xs text-slate-500 mb-4">Ranking cell outreach units by new members added.</p>
                
                <div className="overflow-x-auto max-h-56 overflow-y-auto pr-1">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800 font-extrabold uppercase text-[10px]">
                        <th className="pb-2">Cell Group</th>
                        <th className="pb-2">Regional Chapter</th>
                        <th className="pb-2 text-right">Souls Won</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {cellLeaderboard.map((cell, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/30">
                          <td className="py-2.5 text-slate-200 font-bold flex items-center gap-1.5">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${idx === 0 ? 'bg-yellow-500/10 text-yellow-500' : idx === 1 ? 'bg-slate-300/10 text-slate-350' : 'bg-slate-800 text-slate-400'}`}>
                              {idx + 1}
                            </span>
                            {cell.name}
                          </td>
                          <td className="py-2.5 text-slate-400">{cell.chapter}</td>
                          <td className="py-2.5 text-right font-extrabold text-indigo-400">{cell.souls}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Non-Performance Alerts */}
          <div className="p-6 border border-rose-500/15 bg-rose-500/5 rounded-3xl">
            <h3 className="text-md font-bold text-rose-400 flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="animate-pulse" />
              Pastor Flagging Engine: Non-Performance & Deficit Alerts
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Weekly audit automated notifications flagging cells or regions with active leadership vacancies, 
              missed deadline submissions (for week <span className="font-mono text-rose-300 font-bold">{latestDate}</span>), or negative growth trends.
            </p>

            {cellDeadlinesFlags.length === 0 ? (
              <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle size={16} /> All active cells have met reporting deadlines and performance indexes this week!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cellDeadlinesFlags.map((cell, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-2xl border ${cell.status === 'critical' ? 'bg-rose-950/20 border-rose-500/20 text-rose-350' : 'bg-amber-950/10 border-amber-500/20 text-amber-350'}`}
                  >
                    <div className="flex items-center justify-between font-bold mb-2">
                      <span className="text-sm text-slate-200">{cell.cellName}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${cell.status === 'critical' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {cell.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mb-3">
                      Chapter: <span className="font-semibold text-slate-350">{cell.chapterName}</span> <br />
                      Cell Leader: <span className="font-semibold text-slate-350">{cell.leaderName}</span>
                    </div>
                    <div className="space-y-1.5">
                      {cell.reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                          <XCircle size={12} className="shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Analytics Reveal Report Exporter Modal */}
      {revealedReport && (() => {
        let reportTitle = '';
        let headers = [];
        let rows = [];

        if (revealedReport === 'givings') {
          reportTitle = 'Global Total Givings Audit Report';
          headers = ['Chapter', 'Cell Group', 'Member', 'Category', 'Segment', 'Method', 'Amount', 'Date & Time'];
          rows = confirmedLedger.map(item => {
            const chName = chapters.find(c => c.id === item.chapterId)?.name || 'Unknown';
            const cellName = cells.find(c => c.id === item.cellId)?.name || 'Unknown';
            return [
              chName,
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
          reportTitle = 'Total Souls Won Outreach Report';
          headers = ['Chapter', 'Cell Group', 'Member', 'Souls Won', 'Date & Time'];
          rows = confirmedLedger
            .filter(item => item.newMembersBroughtIn > 0)
            .map(item => {
              const chName = chapters.find(c => c.id === item.chapterId)?.name || 'Unknown';
              const cellName = cells.find(c => c.id === item.cellId)?.name || 'Unknown';
              return [
                chName,
                cellName,
                item.memberName,
                `+${item.newMembersBroughtIn}`,
                new Date(item.createdAt).toLocaleString()
              ];
            });
        } else if (revealedReport === 'chapters') {
          reportTitle = 'Active Chapters & Scope Report';
          headers = ['Chapter Name', 'Headquarters', 'Leader Name', 'Cell Groups', 'Total Members'];
          rows = chapters.map(ch => {
            const chCellsCount = cells.filter(c => c.chapterId === ch.id).length;
            const chMembersCount = users.filter(u => u.chapterId === ch.id && u.role === 'member' && u.status === 'Active').length;
            const leader = users.find(u => u.chapterId === ch.id && u.role === 'chapter_leader')?.name || 'Vacant';
            return [
              ch.name,
              ch.headquarters,
              leader,
              chCellsCount,
              chMembersCount
            ];
          });
        } else if (revealedReport === 'members') {
          reportTitle = 'Active Membership Directory Report';
          headers = ['Member Name', 'Username', 'Title', 'Chapter', 'Cell Group', 'Status'];
          rows = users
            .filter(u => u.role === 'member' && u.status === 'Active')
            .map(u => {
              const chName = chapters.find(ch => ch.id === u.chapterId)?.name || 'None';
              const cellName = cells.find(c => c.id === u.cellId)?.name || 'None';
              return [
                u.name,
                `@${u.username}`,
                u.title || 'Bro',
                chName,
                cellName,
                u.status
              ];
            });
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-905 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-850">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{reportTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Summary of contributors and growth breakdown</p>
                </div>
                <button
                  onClick={() => setRevealedReport(null)}
                  className="text-slate-400 hover:text-slate-200 text-xl font-bold p-1 rounded-lg"
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
                        {headers.map((h, i) => (
                          <th key={i} className="px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 font-medium text-slate-300">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/20 transition-colors">
                          {row.map((val, cIdx) => (
                            <td key={cIdx} className="px-4 py-3">{val}</td>
                          ))}
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
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-350 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all"
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
export default AdminPortal;
