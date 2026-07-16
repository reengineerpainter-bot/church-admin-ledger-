import React, { useState } from 'react';
import { StatCard } from '../Common/StatCard';
import { LineChart, BarChart } from '../Common/SvgCharts';
import { CredentialForm } from './CredentialForm';
import { UserDirectory } from './UserDirectory';
import { 
  TrendingUp, Users, Grid, CheckCircle, XCircle, 
  UserPlus, UserCheck, AlertTriangle, ShieldCheck, Plus, Sparkles, AlertCircle, Calendar, FileText, Camera, Wallet, Trophy, Map
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
  onEditProfile,
  activeModule = 'dashboard',
  globalSearchTerm = ''
}) {
  const [showAddLeader, setShowAddLeader] = useState(false);
  const [newCellName, setNewCellName] = useState('');
  const [cellCity, setCellCity] = useState('');
  const [cellSuccess, setCellSuccess] = useState(false);
  const [revealedReport, setRevealedReport] = useState(null); // 'givings' | 'souls' | 'cells' | 'members' | null
  const [outreachFilter, setOutreachFilter] = useState('All');
  const [givingCategoryFilter, setGivingCategoryFilter] = useState('All');
  const [timeframe, setTimeframe] = useState('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [givingStructureView, setGivingStructureView] = useState('cell');
  const [soulsStructureView, setSoulsStructureView] = useState('cell');

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
  const chapterId = currentUser.chapterId;
  const chapterName = chapters.find(c => c.id === chapterId)?.name || 'Unknown Chapter';

  // chapter cells, users
  const chapterCells = cells.filter(cell => cell.chapterId === chapterId);
  const chapterUsers = users.filter(u => u.chapterId === chapterId);
  
  const cellIds = chapterCells.map(c => c.id);
  
  const chapterLedger = ledger.filter(item => item.chapterId === chapterId || item.memberId === currentUser.id);
  const confirmedLedger = chapterLedger.filter(item => item.status === 'Confirmed');

  const confirmedLedgerFiltered = confirmedLedger.filter(item => filterByTimeframe(item.serviceDate));
  
  const totalChapterGiving = confirmedLedgerFiltered.reduce((sum, item) => sum + item.totalAmount, 0);
  
  const soulsFiltered = souls.filter(s => s.status === 'Approved' && s.chapterId === chapterId && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const totalChapterSouls = confirmedLedgerFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + soulsFiltered.length;

  // Personal metrics
  const mySubmissions = ledger.filter(item => item.memberId === currentUser.id);
  const myConfirmed = mySubmissions.filter(item => item.status === 'Confirmed');
  const mySubmissionsFiltered = mySubmissions.filter(item => filterByTimeframe(item.serviceDate));
  const myConfirmedFiltered = myConfirmed.filter(item => filterByTimeframe(item.serviceDate));

  const myPersonalGiving = myConfirmedFiltered.reduce((sum, item) => sum + (item.amount || item.totalAmount || 0), 0);

  const mySouls = souls.filter(s => s.recordedBy === currentUser.id);
  const mySoulsFiltered = mySouls.filter(s => s.status === 'Approved' && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const myPersonalSouls = myConfirmedFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + mySoulsFiltered.length;

  const myPersonalSubmissions = mySubmissionsFiltered.length;

  // Active users count
  const activeCellLeadersCount = chapterUsers.filter(u => u.role === 'cell_leader' && u.status === 'Active').length;
  const activeMembersCount = chapterUsers.filter(u => u.role === 'member' && u.status === 'Active').length;

  // --- CHART DATA PREPARATION ---
  const weeklyTotalsMap = {};
  confirmedLedgerFiltered.forEach(item => {
    weeklyTotalsMap[item.serviceDate] = (weeklyTotalsMap[item.serviceDate] || 0) + item.totalAmount;
  });
  const weeklyGivingData = Object.keys(weeklyTotalsMap)
    .sort()
    .map(date => {
      const d = new Date(date);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return { label, value: weeklyTotalsMap[date] };
    });

  // Weekly Souls trend
  const weeklySoulsMap = {};
  soulsFiltered.forEach(s => {
    const dateStr = s.recordedAt || s.createdAt;
    if (dateStr) {
      const normalizedDate = new Date(dateStr).toISOString().split('T')[0];
      weeklySoulsMap[normalizedDate] = (weeklySoulsMap[normalizedDate] || 0) + 1;
    }
  });
  confirmedLedgerFiltered.forEach(item => {
    if (item.newMembersBroughtIn > 0) {
      weeklySoulsMap[item.serviceDate] = (weeklySoulsMap[item.serviceDate] || 0) + item.newMembersBroughtIn;
    }
  });
  const weeklySoulsData = Object.keys(weeklySoulsMap)
    .sort()
    .map(date => {
      const d = new Date(date);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return { label, value: weeklySoulsMap[date] };
    });

  // Helper to map L4 Chapters/L5 Cells to dynamic structure names
  const getStructureInfo = (chapterId, cellId) => {
    let chapterNameStr = chapterName || 'Global Chapter';
    let cellNameStr = 'Global Cell';

    if (cellId) {
      const ce = cells.find(c => c.id === cellId);
      if (ce) {
        cellNameStr = ce.name;
      }
    }

    return { chapter: chapterNameStr, cell: cellNameStr };
  };

  // 3. Giving by Structure
  const structureGivingMap = {};
  confirmedLedgerFiltered.forEach(item => {
    const info = getStructureInfo(item.chapterId, item.cellId);
    let key = '';
    if (givingStructureView === 'chapters') key = info.chapter;
    else if (givingStructureView === 'cell') key = info.cell;

    if (key) {
      structureGivingMap[key] = (structureGivingMap[key] || 0) + item.totalAmount;
    }
  });

  const structureGivingData = Object.keys(structureGivingMap)
    .map(name => ({ label: name, value: structureGivingMap[name] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Limit to top 10

  // --- CREDENTIALS WORKFLOW QUEUES ---
  const pendingMembers = users.filter(u => 
    u.status === 'Pending_Higher_Approval' && 
    u.chapterId === currentUser.chapterId
  );

  const pendingSouls = souls.filter(s => {
    if (s.status !== 'Pending_Approval') return false;
    const reporter = users.find(u => u.id === s.recordedBy);
    return reporter && reporter.chapterId === chapterId;
  });

  const pendingGivings = ledger.filter(item => {
    if (item.status !== 'Pending_Cell_Review') return false;
    const reporter = users.find(u => u.id === item.memberId);
    return reporter && reporter.role === 'cell_leader' && reporter.chapterId === chapterId;
  });

  // 4. Soul-winning ranking by Structure
  const structureSoulsMap = {};
  soulsFiltered.forEach(s => {
    const info = getStructureInfo(s.chapterId, s.cellId);
    let key = '';
    let parentName = '';
    if (soulsStructureView === 'chapters') {
      key = info.chapter;
      parentName = 'Regional Headquarter';
    } else if (soulsStructureView === 'cell') {
      key = info.cell;
      parentName = info.chapter;
    }

    if (key) {
      if (!structureSoulsMap[key]) {
        structureSoulsMap[key] = { name: key, parent: parentName, souls: 0 };
      }
      structureSoulsMap[key].souls += 1;
    }
  });

  confirmedLedgerFiltered.forEach(item => {
    if (item.newMembersBroughtIn > 0) {
      const info = getStructureInfo(item.chapterId, item.cellId);
      let key = '';
      let parentName = '';
      if (soulsStructureView === 'chapters') {
        key = info.chapter;
        parentName = 'Regional Headquarter';
      } else if (soulsStructureView === 'cell') {
        key = info.cell;
        parentName = info.chapter;
      }

      if (key) {
        if (!structureSoulsMap[key]) {
          structureSoulsMap[key] = { name: key, parent: parentName, souls: 0 };
        }
        structureSoulsMap[key].souls += item.newMembersBroughtIn;
      }
    }
  });

  const structureSoulsLeaderboard = Object.values(structureSoulsMap)
    .sort((a, b) => b.souls - a.souls)
    .slice(0, 10); // Limit to top 10

  // --- NON-PERFORMANCE FLAGGING SYSTEM ---
  const latestDate = '2026-07-05';
  const cellDeadlinesFlags = chapterCells.map(cell => {
    const hasSubmission = ledger.some(item => item.cellId === cell.id && item.serviceDate === latestDate);
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
      flagReasons.push('Zero outreach conversions');
    }

    return {
      cellId: cell.id,
      cellName: cell.name,
      leaderName: cell.leaderName,
      status: performanceStatus,
      reasons: flagReasons
    };
  }).filter(c => c.reasons.length > 0);

  const handleCreateCell = (e) => {
    e.preventDefault();
    if (!newCellName.trim()) return;
    createCell(newCellName.trim(), chapterId, 'Vacant');
    setNewCellName('');
    setCellCity('');
    setCellSuccess(true);
    setTimeout(() => setCellSuccess(false), 3000);
  };

  const filterBySearch = (items, fields) => {
    if (!globalSearchTerm) return items;
    const term = globalSearchTerm.toLowerCase();
    return items.filter(item => 
      fields.some(field => {
        const val = item[field];
        return val && String(val).toLowerCase().includes(term);
      })
    );
  };

  const filteredLedger = filterBySearch(chapterLedger, ['id', 'memberName', 'category', 'paymentMethod', 'serviceDate']);
  const filteredSouls = filterBySearch(souls.filter(s => s.status === 'Approved' && s.chapterId === chapterId), ['name', 'sex', 'reporterName', 'profession', 'phone', 'outreachProgram']);

  return (
    <div className="space-y-6">
      
      {/* Welcome Bar / Rank Information (Chapter Leader Level 4 Emerald theme representation) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 glass-panel rounded-3xl border-t-2 border-emerald-500/80">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onDoubleClick={onEditProfile}
            className="relative group rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-500/10 shrink-0 border-none cursor-pointer p-0"
            title="Double-click to Edit Profile"
          >
            <UserAvatar user={currentUser} size="lg" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera size={16} />
            </div>
          </button>
          <div>
            <span className="text-xs text-emerald-450 font-extrabold uppercase tracking-wide">Chapter Leader (L4) &rarr; {chapterName}</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight mt-1 bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Senior Care Group Administration</h2>
            <p className="text-slate-400 text-xs mt-1">Managing cells, auditing member credentials, and assessing local financial health.</p>
          </div>
        </div>
      </div>

      {activeModule === 'dashboard' && (
        <>
          {!revealedReport ? (
            <>
              {/* Timeframe Filter */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 bg-slate-900/20 p-4 rounded-3xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight">Chapter Overview & Analytics</h3>
                  <p className="text-[10px] text-slate-555 font-semibold tracking-wider uppercase">Filter chapter statistics by period</p>
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
                  description={`Double-click to reveal giving contributors in ${chapterName}`}
                  status="info"
                  onClick={() => setRevealedReport('givings')}
                />
                <StatCard
                  title="Chapter Souls Won"
                  value={totalChapterSouls}
                  icon={ShieldCheck}
                  description="Double-click to reveal cell and individual soul-winning tallies"
                  status="success"
                  onClick={() => setRevealedReport('souls')}
                />
                <StatCard
                  title="Active Cell Groups"
                  value={chapterCells.length}
                  icon={Grid}
                  description="Double-click to reveal active cells and leaders list"
                  status="default"
                  onClick={() => setRevealedReport('cells')}
                />
                <StatCard
                  title="Registered Members"
                  value={activeMembersCount}
                  icon={Users}
                  description={`Double-click to reveal directory of scoped active members`}
                  status="default"
                  onClick={() => setRevealedReport('members')}
                />
              </div>

              {/* Charts Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="p-6 glass-panel rounded-3xl">
                  <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2 tracking-tight">
                    <TrendingUp size={16} className="text-emerald-500" />
                    Chapter Giving Trends
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Confirmed receipts aggregated by service dates.</p>
                  <div className="h-40 flex items-center">
                    <LineChart data={weeklyGivingData} />
                  </div>
                </div>

                <div className="p-6 glass-panel rounded-3xl">
                  <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2 tracking-tight">
                    <Users size={16} className="text-indigo-400" />
                    Chapter Soulwinning Trends
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Approved soul registrations & ledger data by date.</p>
                  <div className="h-40 flex items-center">
                    <LineChart data={weeklySoulsData} strokeColor="#818cf8" formatValue={(v) => v.toLocaleString()} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="p-6 glass-panel rounded-3xl lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                        <Grid size={16} className="text-emerald-500" />
                        Giving Reciept by Structure
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Fellowship structures performance breakdown in this chapter.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">View By:</span>
                      <select
                        value={givingStructureView}
                        onChange={(e) => setGivingStructureView(e.target.value)}
                        className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs outline-none cursor-pointer font-semibold"
                      >
                        <option value="chapters" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Chapter</option>
                        <option value="cell" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Cell</option>
                      </select>
                    </div>
                  </div>
                  <div className="h-40 flex items-center">
                    <BarChart data={structureGivingData} barColor="#10b981" />
                  </div>
                </div>

                <div className="p-6 glass-panel rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                          <Trophy size={16} className="text-yellow-500" />
                          Soul-Winning Leaderboard
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Outreach performance rankings inside this chapter.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">View By:</span>
                        <select
                          value={soulsStructureView}
                          onChange={(e) => setSoulsStructureView(e.target.value)}
                          className="px-2.5 py-1 bg-slate-950 border border-slate-800 text-slate-300 rounded-xl text-xs outline-none cursor-pointer font-semibold"
                        >
                          <option value="chapters" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Chapter</option>
                          <option value="cell" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Cell</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="overflow-x-auto max-h-56 overflow-y-auto pr-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-555 border-b border-slate-800 font-extrabold uppercase text-[10px] tracking-wide">
                            <th className="pb-2">Name</th>
                            <th className="pb-2">Parent Structure</th>
                            <th className="pb-2 text-right">Souls Won</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {structureSoulsLeaderboard.map((item, idx) => (
                            <tr key={idx} className="ledger-row transition-all duration-200">
                              <td className="py-2.5 text-slate-205 font-bold flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] bg-slate-800 text-slate-400">
                                  {idx + 1}
                                </span>
                                {item.name}
                              </td>
                              <td className="py-2.5 text-slate-450">{item.parent}</td>
                              <td className="py-2.5 text-right font-extrabold text-indigo-400 font-mono tabular-nums">{item.souls}</td>
                            </tr>
                          ))}
                          {structureSoulsLeaderboard.length === 0 && (
                            <tr>
                              <td colSpan="3" className="text-center text-slate-550 italic py-8">No outreach statistics recorded.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="p-6 bg-slate-900/30 border border-slate-800/80 rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2 animate-pulse-soft">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      My Personal Overview & Analytics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <StatCard
                        title="My Personal Giving"
                        value={`$${myPersonalGiving.toLocaleString()}`}
                        icon={TrendingUp}
                        description="Your tithes and offerings"
                        status="info"
                      />
                      <StatCard
                        title="My Personal Outreach"
                        value={`${myPersonalSouls} Souls`}
                        icon={Sparkles}
                        description="Approved souls recorded by you"
                        status="success"
                      />
                      <StatCard
                        title="My Personal Submissions"
                        value={`${myPersonalSubmissions} Entries`}
                        icon={FileText}
                        status="default"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 glass-panel rounded-3xl w-full flex flex-col shadow-2xl animate-fade-in space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-slate-800 bg-slate-900/10 gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{(() => {
                    if (revealedReport === 'givings') return `Chapter Total Givings Report (${chapterName})`;
                    if (revealedReport === 'souls') return `Chapter Souls Won Outreach Report (${chapterName})`;
                    if (revealedReport === 'cells') return `Active Fellowship Cells Report (${chapterName})`;
                    if (revealedReport === 'members') return `Active Member Directory (${chapterName})`;
                    return '';
                  })()}</h3>
                  <p className="text-xs text-slate-555 mt-0.5">Summary of network records and growth breakdown</p>
                </div>
                <div className="flex items-center gap-4">
                  {revealedReport === 'souls' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Outreach:</span>
                      <select
                        value={outreachFilter}
                        onChange={(e) => setOutreachFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-955 border border-slate-800 focus:ring-2 focus:ring-indigo-500/20 text-slate-200 rounded-xl text-xs outline-none"
                      >
                        <option value="All" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>All Programs</option>
                        <option value="Ministry Program" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Ministry Program</option>
                        <option value="Zonal Program" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Zonal Program</option>
                        <option value="Church Program" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Church Program</option>
                        <option value="Chapter Program" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Chapter Program</option>
                        <option value="Cell Program" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Cell Program</option>
                        <option value="Personal Program" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Personal Program</option>
                      </select>
                    </div>
                  )}
                  {revealedReport === 'givings' && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Category:</span>
                      <select
                        value={givingCategoryFilter}
                        onChange={(e) => setGivingCategoryFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-955 border border-slate-800 focus:ring-2 focus:ring-indigo-500/20 text-slate-200 rounded-xl text-xs outline-none"
                      >
                        <option value="All" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>All Categories</option>
                        <option value="Tithe" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Tithe</option>
                        <option value="Offering" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Offering</option>
                        <option value="Partnership" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Partnership</option>
                        <option value="First Fruit" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>First Fruit</option>
                        <option value="Thanksgiving" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Thanksgiving</option>
                        <option value="Church Hosting" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Church Hosting</option>
                        <option value="PCO" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>PCO</option>
                        <option value="PCO Seed" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>PCO Seed</option>
                        <option value="Welfare" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Welfare</option>
                        <option value="Others" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Others</option>
                      </select>
                    </div>
                  )}
                  <button
                    onClick={() => { setRevealedReport(null); setOutreachFilter('All'); setGivingCategoryFilter('All'); }}
                    className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center gap-1.5 transition-all cursor-pointer shadow-lg text-xs font-bold font-sans"
                  >
                    &larr; Back to Dashboard
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-955/40">
                {(() => {
                  let headers = [];
                  let rows = [];
                  let reportTitle = '';

                  if (revealedReport === 'givings') {
                    reportTitle = `Chapter Total Givings Report (${chapterName})`;
                    headers = ['Cell Group', 'Member', 'Category', 'Segment', 'Method', 'Amount', 'Date & Time'];
                    const displayGivings = confirmedLedger.filter(item => givingCategoryFilter === 'All' || item.category === givingCategoryFilter);
                    rows = [...displayGivings]
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
                    reportTitle = `Chapter Souls Won Outreach Report (${chapterName})`;
                    headers = ['Soul Name', 'Gender', 'Profession', 'Phone Number', 'Outreach Program', 'Cell Group', 'Recorded By', 'Date & Time'];
                    const chapterSouls = souls.filter(s => s.status === 'Approved' && s.chapterId === chapterId && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
                    const displaySouls = chapterSouls.filter(s => outreachFilter === 'All' || s.outreachProgram === outreachFilter);
                    rows = displaySouls.map(s => {
                      const cellName = cells.find(c => c.id === s.cellId)?.name || 'Unknown';
                      return [
                        s.name,
                        s.sex,
                        s.profession,
                        s.phone,
                        s.outreachProgram || 'Personal Program',
                        cellName,
                        s.reporterName || 'Unknown',
                        s.recordedAt || s.createdAt || 'N/A'
                      ];
                    });
                  } else if (revealedReport === 'cells') {
                    reportTitle = `Active Fellowship Cells Report (${chapterName})`;
                    headers = ['Cell Name', 'Leader Name', 'Total Members', 'Weekly Status'];
                    rows = chapterCells.map(c => {
                      const membersCount = users.filter(u => u.cellId === c.id && u.role === 'member').length;
                      return [
                        c.name,
                        c.leaderName || 'Vacant',
                        `${membersCount} Members`,
                        'Reporting Active'
                      ];
                    });
                  } else if (revealedReport === 'members') {
                    reportTitle = `Active Member Directory (${chapterName})`;
                    headers = ['Member Name', 'Username', 'Title', 'Cell Group', 'Status'];
                    rows = chapterUsers
                      .filter(u => u.role === 'member')
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
                    <>
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-550 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                            {headers.map((h, i) => {
                              const isAmountHeader = h.toLowerCase().includes('amount') || h.toLowerCase().includes('souls') || h.toLowerCase().includes('giving') || h.toLowerCase().includes('givings') || h.toLowerCase().includes('base');
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

                      <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/20">
                        <div className="text-[10px] text-slate-555 font-extrabold uppercase">Export Format Options:</div>
                        <div className="flex gap-2.5">
                          <button
                            onClick={() => exportToTxt(reportTitle, headers, rows)}
                            className="px-3.5 py-2 bg-slate-955 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
                          >
                            Download TXT
                          </button>
                          <button
                            onClick={() => exportToWord(reportTitle, headers, rows)}
                            className="px-3.5 py-2 bg-slate-955 border border-slate-800 text-slate-350 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
                          >
                            Download Word
                          </button>
                          <button
                            onClick={() => triggerPrint(reportTitle, headers, rows)}
                            className="px-3.5 py-2 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md cursor-pointer border-none"
                          >
                            Print Report
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </>
      )}

      {activeModule === 'ledger' && (
        <div className="p-6 glass-panel rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                <FileText size={16} className="text-emerald-500" />
                Chapter Ledger Register
              </h3>
              <p className="text-xs text-slate-500">Rigid vertical alignment of all weekly giving entries and audits in {chapterName}.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToTxt('Chapter Ledger Register', ['ID', 'Member', 'Category', 'Method', 'Date', 'Amount', 'Status'], chapterLedger.map(item => [item.id, item.memberName, item.category, item.paymentMethod, item.serviceDate, `$${item.totalAmount}`, item.status]))}
                className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-350 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                Export TXT
              </button>
              <button
                onClick={() => triggerPrint('Chapter Ledger Register', ['ID', 'Member', 'Category', 'Method', 'Date', 'Amount', 'Status'], chapterLedger.map(item => [item.id, item.memberName, item.category, item.paymentMethod, item.serviceDate, `$${item.totalAmount}`, item.status]))}
                className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold rounded-xl text-xs active:scale-95 transition-all shadow-md cursor-pointer border-none"
              >
                Print PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Member Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Service Date</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5 text-right">Total Amount</th>
                  <th className="px-6 py-3.5 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {filteredLedger.map(item => (
                  <tr 
                    key={item.id} 
                    onDoubleClick={() => setSelectedReceipt(item)}
                    className="ledger-row cursor-pointer"
                    title="Double-click to view proof of payment receipt"
                  >
                    <td className="px-6 py-3 font-mono text-[10px] text-slate-550">{item.id}</td>
                    <td className="px-6 py-3 text-slate-100 font-bold">{item.memberName}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.category === 'Tithe' ? 'badge-indigo-soft' : 'badge-slate-soft'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-400">{item.serviceDate}</td>
                    <td className="px-6 py-3 text-slate-450">{item.paymentMethod}</td>
                    <td className="px-6 py-3 text-right text-indigo-400 font-bold font-tabular">${item.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.status === 'Confirmed' ? 'badge-emerald-soft' : 'badge-amber-soft'}`}>
                        {item.status === 'Confirmed' ? 'Verified' : 'Pending Review'}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredLedger.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-slate-650 py-12 italic">No chapter ledger records match active search filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {activeModule === 'souls' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 glass-panel rounded-3xl space-y-4">
            <div>
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                <Trophy size={16} className="text-emerald-500" />
                Chapter Soul Outreach Tracker
              </h3>
              <p className="text-xs text-slate-500">Confirmed outreach additions recorded in {chapterName}.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                    <th className="px-6 py-3.5">Soul Name</th>
                    <th className="px-6 py-3.5">Sex</th>
                    <th className="px-6 py-3.5">Profession</th>
                    <th className="px-6 py-3.5">Outreach Program</th>
                    <th className="px-6 py-3.5">Phone Number</th>
                    <th className="px-6 py-3.5">Recorded By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 font-medium">
                  {filteredSouls.map(soul => (
                    <tr key={soul.id} className="ledger-row">
                      <td className="px-6 py-3 text-slate-105 font-bold">{soul.name}</td>
                      <td className="px-6 py-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900">{soul.sex}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-400">{soul.profession}</td>
                      <td className="px-6 py-3 text-slate-350 font-semibold">{soul.outreachProgram || 'Personal Program'}</td>
                      <td className="px-6 py-3 font-mono text-slate-450">{soul.phone}</td>
                      <td className="px-6 py-3 text-slate-350">{soul.reporterName}</td>
                    </tr>
                  ))}
                  {filteredSouls.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-slate-650 py-12 italic">No outreach records match search constraints.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <RecordSoulForm
              currentUser={currentUser}
              chapters={chapters}
              cells={cells}
              onSubmit={submitSoulRecord}
            />
          </div>
        </div>
      )}

      {activeModule === 'deficits' && (
        <div className="p-6 border border-rose-500/15 bg-rose-500/5 rounded-3xl">
          <h3 className="text-md font-bold text-rose-400 flex items-center gap-2 mb-2 tracking-tight">
            <AlertTriangle size={18} className="animate-pulse" />
            Chapter Flagging Engine: Cell Deadlines & Deficits
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Automated alerts flagging cells in {chapterName} with missed reporting deadlines (week <span className="font-mono text-rose-300 font-bold">{latestDate}</span>), vacancies, or giving deficits.
          </p>

          {cellDeadlinesFlags.length === 0 ? (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs rounded-xl font-semibold flex items-center gap-2">
              <CheckCircle size={16} /> All active fellowship cells have met reporting indices this week.
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
                  <div className="text-[10px] text-slate-500 mb-3">
                    Cell Leader: <span className="font-semibold text-slate-400">{cell.leaderName}</span>
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
      )}

      {activeModule === 'audits' && (
        <div className="space-y-6">

          {/* User approvals */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 mb-4 tracking-tight">
              <UserCheck size={18} className="text-amber-500" />
              Two-Tier Credential Queue: Pending Chapter Leader Confirmation
            </h3>
            {pendingMembers.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
                <table className="w-full border-collapse text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-550 uppercase tracking-wider font-extrabold bg-slate-900/60 text-[10px]">
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Username</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Assignment</th>
                      <th className="px-4 py-3">Creator</th>
                      <th className="px-4 py-3">Temp Password</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {pendingMembers.map(u => {
                      const creator = users.find(creatorUser => creatorUser.id === u.creatorId);
                      const cell = cells.find(c => c.id === u.cellId);
                      const getRoleBadgeLabel = (r) => {
                        if (r === 'group_pastor') return 'Group Pastor (L2)';
                        if (r === 'pastor') return 'Pastor (L3)';
                        if (r === 'chapter_leader') return 'Chapter Leader (L4)';
                        if (r === 'cell_leader') return 'Cell Leader (L5)';
                        return 'Member (L6)';
                      };
                      return (
                        <tr key={u.id} className="hover:bg-slate-850/30 transition-colors font-medium">
                          <td className="px-4 py-3 text-slate-100 font-bold">{u.name}</td>
                          <td className="px-4 py-3 text-slate-350">@{u.username}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-900/50 uppercase">{getRoleBadgeLabel(u.role)}</span>
                          </td>
                          <td className="px-4 py-3 text-cyan-400">{cell?.name || 'Chapter Level'}</td>
                          <td className="px-4 py-3 text-slate-400">{creator?.name || 'System / Zonal'}</td>
                          <td className="px-4 py-3 font-mono">{u.tempPassword}</td>
                          <td className="px-4 py-3 text-right flex items-center justify-end gap-2">
                            <button
                              onClick={() => approveCredential(u.id)}
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-450 font-bold rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <CheckCircle size={12} /> Confirm
                            </button>
                            <button
                              onClick={() => rejectCredential(u.id)}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-455 font-bold rounded-lg border border-rose-500/20 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
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
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center bg-slate-950/20 rounded-2xl border border-slate-850 border-dashed">
                <CheckCircle size={28} className="text-slate-600 mb-2" />
                <span className="text-xs font-bold text-slate-400">All Credentials Active</span>
                <span className="text-[10px] text-slate-550 mt-0.5">There are no pending credentials awaiting confirmation in your chapter.</span>
              </div>
            )}
          </div>

          {/* Souls verification */}
          {pendingSouls.length > 0 && (
            <div className="p-6 border border-indigo-500/15 bg-indigo-500/5 rounded-3xl">
              <h3 className="text-md font-bold text-indigo-400 flex items-center gap-2 mb-4 tracking-tight">
                <Sparkles size={18} />
                Souls Awaiting Chapter Confirmation ({pendingSouls.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSouls.map(soul => (
                  <div key={soul.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3 font-medium">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-205">{soul.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900">{soul.sex}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Recorded by: <span className="text-slate-400 font-semibold">{soul.reporterName}</span></p>
                      <div className="mt-2 text-xs space-y-1 text-slate-450 border-t border-slate-900 pt-2">
                        <p><span className="text-slate-500 font-semibold">Profession:</span> {soul.profession}</p>
                        <p><span className="text-slate-500 font-semibold">Outreach Program:</span> {soul.outreachProgram || 'Personal Program'}</p>
                        <p><span className="text-slate-500 font-semibold">Phone:</span> {soul.phone}</p>
                        <p><span className="text-slate-500 font-semibold">Address:</span> {soul.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-slate-900 pt-2.5">
                      <button
                        onClick={() => approveSoul(soul.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer border-none"
                      >
                        Confirm & Activate
                      </button>
                      <button
                        onClick={() => rejectSoul(soul.id)}
                        className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 font-bold rounded-lg text-[10px] transition-colors border border-rose-500/10 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Giving audits */}
          {pendingGivings.length > 0 && (
            <div className="p-6 border border-amber-500/15 bg-amber-500/5 rounded-3xl">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2 mb-4 tracking-tight">
                <AlertCircle size={18} />
                Financial Audit Queue: Pending Chapter Review ({pendingGivings.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingGivings.map(item => (
                  <div key={item.id} className="bg-slate-950 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-100">{item.memberName}</span>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 font-mono">
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
                          <span className="text-[10px] px-2 py-0.5 rounded badge-indigo-soft font-bold uppercase">{item.category}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-900 pt-2 font-bold text-sm">
                          <span className="text-slate-300">Amount:</span>
                          <span className="text-emerald-450 font-mono tabular-nums">${item.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-slate-900 pt-3">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg text-[10px] transition-colors border border-indigo-500/10 cursor-pointer"
                      >
                        View Proof
                      </button>
                      <button
                        onClick={() => verifyLedgerEntry(item.id, true)}
                        className="flex-1 py-2 bg-emerald-650 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer border-none"
                      >
                        Approve Receipt
                      </button>
                      <button
                        onClick={() => verifyLedgerEntry(item.id, false)}
                        className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 font-bold rounded-lg text-[10px] transition-colors border border-rose-500/10 cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeModule === 'access_control' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* create credentials form */}
            <div className="flex-1">
              <CredentialForm
                creatorRole={currentUser.role}
                targetRole="cell_leader"
                chapters={chapters}
                cells={cells}
                currentChapterId={chapterId}
                onSubmit={createCredential}
              />
            </div>
            
            {/* establish cell form */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl h-fit w-full lg:w-80 shadow-lg">
              <h3 className="text-sm font-bold text-slate-101 mb-2 flex items-center gap-2 tracking-tight">
                <Map size={16} className="text-indigo-400" />
                Establish New Location / Structure
              </h3>
              <p className="text-[10px] text-slate-450 leading-relaxed mb-4">
                Chapter Administration: Add a new Fellowship Cell under your jurisdiction in {chapterName}.
              </p>
              {cellSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold">
                  Cell group established successfully!
                </div>
              )}
              <form onSubmit={handleCreateCell} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">Structure Type</label>
                  <select
                    disabled
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 text-slate-400 rounded-xl text-xs outline-none cursor-not-allowed"
                  >
                    <option>cell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-450 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">Structure Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Joy Cell"
                    value={newCellName}
                    onChange={(e) => setNewCellName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">Structure City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos"
                    value={cellCity}
                    onChange={(e) => setCellCity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-100 rounded-xl text-xs outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer border-none shadow-md"
                >
                  Establish Location / Structure
                </button>
              </form>
            </div>
          </div>

          <div className="mt-6">
            <UserDirectory
              currentUser={currentUser}
              users={chapterUsers}
              chapters={chapters}
              cells={cells}
              updateUser={updateUser}
            />
          </div>
        </div>
      )}

      {activeModule === 'personal_givings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: My Personal Givings History list */}
            <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
              <div>
                <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                  <Wallet size={16} className="text-indigo-400" />
                  My Personal Givings History
                </h3>
                <p className="text-xs text-slate-500">Record and status summary of your own weekly ledger submissions.</p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                      <th className="px-6 py-3.5">Transaction ID</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Service Date</th>
                      <th className="px-6 py-3.5">Payment Method</th>
                      <th className="px-6 py-3.5 text-right">Amount</th>
                      <th className="px-6 py-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 font-medium text-slate-300">
                    {mySubmissions.map(item => (
                      <tr 
                        key={item.id} 
                        onDoubleClick={() => setSelectedReceipt(item)}
                        className="ledger-row cursor-pointer transition-colors"
                        title="Double-click to view details"
                      >
                        <td className="px-6 py-3 font-mono text-[10px] text-slate-550">{item.id}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.category === 'Tithe' ? 'badge-indigo-soft' : 'badge-slate-soft'}`}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-3 font-mono text-slate-400">{item.serviceDate}</td>
                        <td className="px-6 py-3 text-slate-400">{item.paymentMethod}</td>
                        <td className="px-6 py-3 text-right text-indigo-400 font-bold font-mono tabular-nums">${item.totalAmount.toLocaleString()}</td>
                        <td className="px-6 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.status === 'Confirmed' ? 'badge-emerald-soft' : 'badge-amber-soft'}`}>
                            {item.status === 'Confirmed' ? 'Verified' : 'Pending Review'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {mySubmissions.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center text-slate-650 py-12 italic">No personal weekly giving logs recorded.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right side: Record Giving Form */}
            <div>
              <RecordGivingForm
                currentUser={currentUser}
                onSubmit={submitLedgerEntry}
                showAttendance={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Exporter modal is now rendered inline above */}

      {/* Double click receipt auditing modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 flex flex-col justify-between max-h-[90vh] shadow-2xl">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-slate-100">{selectedReceipt.memberName}</h3>
                  <span className="text-[10px] text-slate-550 font-mono">Audit Transaction ID: {selectedReceipt.id}</span>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-400 hover:text-slate-205 font-bold text-lg cursor-pointer bg-transparent border-none"
                >
                  &times;
                </button>
              </div>

              {/* Simulated Receipt Preview */}
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 min-h-60 shadow-inner relative overflow-hidden">
                <div className="absolute inset-0 opacity-5 bg-[linear-gradient(#6366f1_1px,transparent_1px),linear-gradient(90deg,#6366f1_1px,transparent_1px)] bg-[size:16px_16px]" />
                <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-bold text-slate-300">RECEIPT ATTACHMENT DETAILS</span>
                <div className="text-xs space-y-1.5 text-slate-400 text-left bg-slate-900/60 p-4 rounded-xl border border-slate-850 w-full font-medium">
                  <div>Segment: <strong className="text-slate-205">{selectedReceipt.segment || 'Local'}</strong></div>
                  <div>Category: <strong className="text-indigo-400 font-bold uppercase">{selectedReceipt.category || 'Tithe'}</strong></div>
                  {selectedReceipt.description && (
                    <div>Memo: <span className="text-slate-350 italic">"{selectedReceipt.description}"</span></div>
                  )}
                  <div className="pt-2 border-t border-slate-800/80">Service Date: <strong className="text-slate-300 font-mono">{selectedReceipt.serviceDate}</strong></div>
                  <div>Payment: <strong className="text-slate-300">{selectedReceipt.paymentMethod}</strong></div>
                  <div>File: <strong className="text-indigo-400 font-mono">{selectedReceipt.receiptUrl}</strong></div>
                </div>
                <div className="text-lg font-extrabold text-emerald-450 font-mono mt-2 tabular-nums">
                  Verified Amount: ${selectedReceipt.amount || selectedReceipt.totalAmount}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 border-t border-slate-800 pt-4 mt-6">
              {selectedReceipt.status !== 'Confirmed' ? (
                <>
                  <button
                    onClick={() => {
                      verifyLedgerEntry(selectedReceipt.id, true);
                      setSelectedReceipt(null);
                    }}
                    className="flex-1 py-2 bg-emerald-650 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border-none"
                  >
                    Confirm & Verify
                  </button>
                  <button
                    onClick={() => {
                      verifyLedgerEntry(selectedReceipt.id, false);
                      setSelectedReceipt(null);
                    }}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 font-bold rounded-xl text-xs border border-rose-500/10 cursor-pointer"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <div className="w-full p-2.5 bg-emerald-550/10 border border-emerald-500/20 text-emerald-450 text-xs rounded-xl font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle size={14} /> Audit Completed (Confirmed)
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default ChapterPortal;
