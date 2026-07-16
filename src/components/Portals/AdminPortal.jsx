import React, { useState } from 'react';
import { StatCard } from '../Common/StatCard';
import { LineChart, DonutChart, BarChart } from '../Common/SvgCharts';
import { CredentialForm } from './CredentialForm';
import { UserDirectory } from './UserDirectory';
import { 
  TrendingUp, Users, Map, Grid, CheckCircle, XCircle, 
  UserPlus, UserCheck, AlertTriangle, Trophy, Calendar, Sparkles, AlertCircle, FileText, Camera, Wallet
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
  createCell,
  updateUser,
  approveUserDeletion,
  rejectUserDeletion,
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
  const [structureType, setStructureType] = useState(() => {
    const role = currentUser?.role;
    if (role === 'admin') return 'group';
    if (role === 'group_pastor') return 'church';
    return 'cell';
  });
  const [newStructureName, setNewStructureName] = useState('');
  const [newStructureHq, setNewStructureHq] = useState('');
  const [newStructureChapterId, setNewStructureChapterId] = useState('');
  const [structureSuccess, setStructureSuccess] = useState(false);
  const [revealedReport, setRevealedReport] = useState(null); // 'givings' | 'souls' | 'chapters' | 'members' | null
  const [outreachFilter, setOutreachFilter] = useState('All');
  const [givingCategoryFilter, setGivingCategoryFilter] = useState('All');
  const [timeframe, setTimeframe] = useState('monthly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const getRoleMeta = () => {
    if (currentUser.role === 'group_pastor') {
      return {
        roleLabel: 'Group Pastor (L2)',
        title: 'Group Care Administration',
        desc: 'Oversight of designated group chapters, cells, members, and audit reports.',
        borderColor: 'border-slate-500/80',
        ringColor: 'ring-slate-500/10',
        textColor: 'text-slate-400',
        gradient: 'from-slate-400 via-slate-350 to-slate-500'
      };
    }
    if (currentUser.role === 'pastor') {
      return {
        roleLabel: 'Pastor (L3)',
        title: 'Chapter Care Administration',
        desc: 'Spiritual and structural care supervision of chapter, cells, and weekly member ledger inputs.',
        borderColor: 'border-blue-500/80',
        ringColor: 'ring-blue-500/10',
        textColor: 'text-blue-400',
        gradient: 'from-blue-400 to-indigo-500'
      };
    }
    return {
      roleLabel: 'Zonal Pastor (L1)',
      title: 'Global Root Administration',
      desc: 'Full structural oversight of all chapters, cells, members, and giving receipts.',
      borderColor: 'border-amber-500/80',
      ringColor: 'ring-amber-500/10',
      textColor: 'text-amber-500',
      gradient: 'from-amber-400 via-yellow-500 to-amber-600'
    };
  };

  const meta = getRoleMeta();

  const getSelectableStructureTypes = () => {
    const role = currentUser.role;
    if (role === 'admin') {
      return [
        { value: 'group', label: 'group church' },
        { value: 'church', label: 'church' },
        { value: 'chapter', label: 'chapter' },
        { value: 'cell', label: 'cell' }
      ];
    }
    if (role === 'group_pastor') {
      return [
        { value: 'church', label: 'church' },
        { value: 'chapter', label: 'chapter' },
        { value: 'cell', label: 'cell' }
      ];
    }
    return [
      { value: 'cell', label: 'cell' }
    ];
  };

  const selectableStructureTypes = getSelectableStructureTypes();

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
  const confirmedLedger = ledger.filter(item => {
    if (item.status !== 'Confirmed') return false;
    if (currentUser.role === 'admin') return true; // Zonal Pastor L1 sees overall records
    return item.chapterId === currentUser.chapterId || item.memberId === currentUser.id;
  });
  
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

  // 1b. Weekly Souls trend
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

  // 2. Giving allocation breakdown
  const categoryTotalsMap = {};
  confirmedLedgerFiltered.forEach(item => {
    categoryTotalsMap[item.category] = (categoryTotalsMap[item.category] || 0) + item.totalAmount;
  });
  const givingTypeData = Object.keys(categoryTotalsMap)
    .map(cat => ({ label: cat, value: categoryTotalsMap[cat] }));

  // 3. Giving by Chapter
  const chapterGivingMap = {};
  chapters.forEach(ch => {
    chapterGivingMap[ch.name] = 0;
  });
  confirmedLedgerFiltered.forEach(item => {
    const chName = chapters.find(c => c.id === item.chapterId)?.name;
    if (chName) {
      chapterGivingMap[chName] = (chapterGivingMap[chName] || 0) + item.totalAmount;
    }
  });
  const chapterGivingData = Object.keys(chapterGivingMap)
    .map(name => ({ label: name, value: chapterGivingMap[name] }));

  // 4. Soul-winning ranking
  const cellSoulsMap = {};
  cells.forEach(cell => {
    const chName = chapters.find(ch => ch.id === cell.chapterId)?.name || 'Unknown';
    cellSoulsMap[cell.id] = { name: cell.name, chapter: chName, souls: 0 };
  });
  soulsFiltered.forEach(s => {
    if (cellSoulsMap[s.cellId]) {
      cellSoulsMap[s.cellId].souls += 1;
    }
  });
  confirmedLedgerFiltered.forEach(item => {
    if (cellSoulsMap[item.cellId]) {
      cellSoulsMap[item.cellId].souls += item.newMembersBroughtIn;
    }
  });
  const cellLeaderboard = Object.values(cellSoulsMap)
    .sort((a, b) => b.souls - a.souls);

  // --- CREDENTIALS WORKFLOW QUEUES ---
  const pendingCellLeaders = users.filter(u => {
    if (u.status !== 'Pending_Higher_Approval') return false;
    if (currentUser.role === 'admin') return true; // Zonal Pastor L1 sees overall database queue
    return u.chapterId === currentUser.chapterId || u.creatorId === currentUser.id;
  });

  const activeChapterLeadersList = users.filter(u => u.role === 'chapter_leader' && u.status === 'Active');
  const activeCellLeadersList = users.filter(u => u.role === 'cell_leader' && u.status === 'Active');

  // --- NON-PERFORMANCE FLAGGING SYSTEM ---
  const latestDate = '2026-07-05';
  
  const cellDeadlinesFlags = cells.map(cell => {
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
      chapterName: chapters.find(ch => ch.id === cell.chapterId)?.name || 'Unknown',
      leaderName: cell.leaderName,
      status: performanceStatus,
      reasons: flagReasons
    };
  }).filter(c => c.reasons.length > 0);

  const handleEstablishStructure = (e) => {
    e.preventDefault();
    if (!newStructureName.trim()) return;

    if (structureType === 'cell') {
      if (!newStructureChapterId) return;
      createCell(newStructureName.trim(), newStructureChapterId);
      setNewStructureName('');
      setStructureSuccess(true);
      setTimeout(() => setStructureSuccess(false), 2000);
    } else {
      createChapter(newStructureName.trim(), newStructureHq.trim() || 'Global Region', structureType);
      setNewStructureName('');
      setNewStructureHq('');
      setStructureSuccess(true);
      setTimeout(() => setStructureSuccess(false), 2000);
    }
  };

  // Filter list by global search term
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

  const filteredLedger = filterBySearch(ledger, ['id', 'memberName', 'category', 'paymentMethod', 'serviceDate']);
  const filteredSouls = filterBySearch(souls.filter(s => s.status === 'Approved'), ['name', 'sex', 'reporterName', 'profession', 'phone', 'outreachProgram']);

  return (
    <div className="space-y-6">
      
      {/* Welcome Bar / Rank Information */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 glass-panel rounded-3xl border-t-2 ${meta.borderColor}`}>
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onDoubleClick={onEditProfile}
            className={`relative group rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all ring-4 ${meta.ringColor} shrink-0 border-none cursor-pointer p-0`}
            title="Double-click to Edit Profile"
          >
            <UserAvatar user={currentUser} size="lg" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera size={16} />
            </div>
          </button>
          <div>
            <span className={`text-xs ${meta.textColor} font-extrabold uppercase tracking-wide`}>{meta.roleLabel}</span>
            <h2 className={`text-xl sm:text-2xl font-extrabold text-slate-105 tracking-tight mt-1 bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>{meta.title}</h2>
            <p className="text-slate-400 text-xs mt-1">{meta.desc}</p>
          </div>
        </div>
      </div>

      {/* RENDER VIEWS ACCORDING TO SIDENAV MODULES */}

      {activeModule === 'dashboard' && (
        <>
          {!revealedReport ? (
            <>
              {/* Timeframe Filter for Metrics & Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 bg-slate-900/20 p-4 rounded-3xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 tracking-tight">Global Overview & Analytics</h3>
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
                  description="Double-click to reveal breakdown of chapter, cell, and member giving"
                  status="info"
                  onClick={() => setRevealedReport('givings')}
                />
                <StatCard
                  title="Total Souls Won"
                  value={totalSoulsWon}
                  icon={Trophy}
                  description="Double-click to reveal cell group and individual soul-winning tallies"
                  status="success"
                  onClick={() => setRevealedReport('souls')}
                />
                <StatCard
                  title="Active Chapters"
                  value={chapters.length}
                  icon={Map}
                  description="Double-click to reveal regional headquarters details and leadership"
                  status="default"
                  onClick={() => setRevealedReport('chapters')}
                />
                <StatCard
                  title="Active Member Base"
                  value={activeMembersCount}
                  icon={Users}
                  description={`Double-click to reveal full database list of active members`}
                  status="default"
                  onClick={() => setRevealedReport('members')}
                />
              </div>

              {/* Charts Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="p-6 glass-panel rounded-3xl">
                  <h3 className="text-md font-bold text-slate-105 mb-2 flex items-center gap-2 tracking-tight">
                    <TrendingUp size={16} className="text-amber-500" />
                    Global Weekly Giving Trends
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Confirmed receipts aggregated by service dates.</p>
                  <div className="h-40 flex items-center">
                    <LineChart data={weeklyGivingData} />
                  </div>
                </div>

                <div className="p-6 glass-panel rounded-3xl">
                  <h3 className="text-md font-bold text-slate-105 mb-2 flex items-center gap-2 tracking-tight">
                    <Users size={16} className="text-indigo-400" />
                    Global Weekly Soulwinning Trends
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Approved soul registrations & ledger data by date.</p>
                  <div className="h-40 flex items-center">
                    <LineChart data={weeklySoulsData} strokeColor="#818cf8" formatValue={(v) => v.toLocaleString()} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="p-6 glass-panel rounded-3xl">
                  <h3 className="text-md font-bold text-slate-105 mb-2 flex items-center gap-2 tracking-tight">
                    <Grid size={16} className="text-amber-500" />
                    Giving Breakdown
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Category allocation of received funds within selected timeframe.</p>
                  <div className="h-40 flex items-center justify-center">
                    <DonutChart data={givingTypeData} size={150} />
                  </div>
                </div>

                <div className="p-6 glass-panel rounded-3xl lg:col-span-2">
                  <h3 className="text-md font-bold text-slate-105 mb-2 flex items-center gap-2 tracking-tight">
                    <Map size={16} className="text-amber-500" />
                    Giving Receipts by Regional Chapter
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">Regional performance based on audit confirmed transactions within selected timeframe.</p>
                  <div className="h-40 flex items-center">
                    <BarChart data={chapterGivingData} barColor="#f59e0b" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6">
                <div className="p-6 glass-panel rounded-3xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-md font-bold text-slate-105 mb-2 flex items-center gap-2 tracking-tight">
                      <Trophy size={16} className="text-yellow-500" />
                      Cell Group Soul-Winning Leaderboard
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">Ranking cell outreach units by new members added within selected timeframe.</p>
                    
                    <div className="overflow-x-auto max-h-56 overflow-y-auto pr-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="text-slate-500 border-b border-slate-800 font-extrabold uppercase text-[10px] tracking-wide">
                            <th className="pb-2">Cell Group</th>
                            <th className="pb-2">Regional Chapter</th>
                            <th className="pb-2 text-right">Souls Won</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {cellLeaderboard.map((cell, idx) => (
                            <tr key={idx} className="ledger-row transition-all duration-250">
                              <td className="py-2.5 text-slate-205 font-bold flex items-center gap-1.5">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[9px] ${idx === 0 ? 'bg-yellow-500/10 text-yellow-500' : idx === 1 ? 'bg-slate-350/10 text-slate-350' : 'bg-slate-800 text-slate-400'}`}>
                                  {idx + 1}
                                </span>
                                {cell.name}
                              </td>
                              <td className="py-2.5 text-slate-450">{cell.chapter}</td>
                              <td className="py-2.5 text-right font-extrabold text-indigo-400 font-mono tabular-nums">{cell.souls}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                    if (revealedReport === 'givings') return 'Global Total Givings Audit Report';
                    if (revealedReport === 'souls') return 'Global Souls Won Outreach Report';
                    if (revealedReport === 'chapters') return 'Active Regional Chapters List';
                    if (revealedReport === 'members') return 'Active Member Directory';
                    return '';
                  })()}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Summary of network records and growth breakdown</p>
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

              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                {(() => {
                  let headers = [];
                  let rows = [];
                  let reportTitle = '';

                  if (revealedReport === 'givings') {
                    reportTitle = 'Global Total Givings Audit Report';
                    headers = ['Chapter', 'Cell Group', 'Member', 'Category', 'Segment', 'Method', 'Amount', 'Date & Time'];
                    const displayGivings = confirmedLedger.filter(item => givingCategoryFilter === 'All' || item.category === givingCategoryFilter);
                    rows = [...displayGivings]
                      .sort((a, b) => b.totalAmount - a.totalAmount)
                      .map(item => {
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
                    reportTitle = 'Global Souls Won Outreach Report';
                    headers = ['Soul Name', 'Gender', 'Profession', 'Phone Number', 'Outreach Program', 'Cell Group', 'Chapter', 'Recorded By', 'Date & Time'];
                    const displaySouls = souls.filter(s => s.status === 'Approved' && (outreachFilter === 'All' || s.outreachProgram === outreachFilter));
                    rows = displaySouls.map(s => {
                      const cellName = cells.find(c => c.id === s.cellId)?.name || 'Unknown';
                      const chName = chapters.find(c => c.id === s.chapterId)?.name || 'Unknown';
                      return [
                        s.name,
                        s.sex,
                        s.profession,
                        s.phone,
                        s.outreachProgram || 'Personal Program',
                        cellName,
                        chName,
                        s.reporterName || 'Unknown',
                        s.recordedAt || s.createdAt || 'N/A'
                      ];
                    });
                  } else if (revealedReport === 'chapters') {
                    reportTitle = 'Active Regional Chapters List';
                    headers = ['Chapter Name', 'Leader/Pastor', 'Cells Count', 'Members Count', 'Status'];
                    rows = chapters.map(ch => {
                      const chCells = cells.filter(c => c.chapterId === ch.id).length;
                      const chMembers = users.filter(u => u.chapterId === ch.id && u.role === 'member').length;
                      return [
                        ch.name,
                        ch.leaderName || 'Vacant',
                        `${chCells} Cells`,
                        `${chMembers} Members`,
                        'Active'
                      ];
                    });
                  } else if (revealedReport === 'members') {
                    reportTitle = 'Active Member Directory';
                    headers = ['Name', 'Username', 'Title', 'Chapter', 'Cell Group', 'Status'];
                    rows = users
                      .filter(u => u.role === 'member')
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

                      <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-955/20">
                        <div className="text-[10px] text-slate-500 font-extrabold uppercase">Export Format Options:</div>
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
                <FileText size={16} className="text-amber-500" />
                Church Ledger Register
              </h3>
              <p className="text-xs text-slate-500">Rigid vertical alignment of all weekly giving entries and audits.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToTxt('Full Church Ledger Register', ['ID', 'Member', 'Category', 'Method', 'Date', 'Amount', 'Status'], ledger.map(item => [item.id, item.memberName, item.category, item.paymentMethod, item.serviceDate, `$${item.totalAmount}`, item.status]))}
                className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-350 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                Export TXT
              </button>
              <button
                onClick={() => triggerPrint('Full Church Ledger Register', ['ID', 'Member', 'Category', 'Method', 'Date', 'Amount', 'Status'], ledger.map(item => [item.id, item.memberName, item.category, item.paymentMethod, item.serviceDate, `$${item.totalAmount}`, item.status]))}
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
                    <td className="px-6 py-3 font-mono text-[10px] text-slate-500">{item.id}</td>
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
                    <td colSpan="7" className="text-center text-slate-650 py-12 italic">No transaction entries found matching active search.</td>
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
                <Trophy size={16} className="text-amber-500" />
                Soul Outreach Tracker
              </h3>
              <p className="text-xs text-slate-500">Full register of confirmed church database outreach additions.</p>
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
                      <td colSpan="6" className="text-center text-slate-650 py-12 italic">No outreach additions recorded in system.</td>
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
        <div className="space-y-6">
          
          {/* Chapter Non-Performance flags */}
          <div className="p-6 border border-rose-500/15 bg-rose-500/5 rounded-3xl">
            <h3 className="text-md font-bold text-rose-400 flex items-center gap-2 mb-2 tracking-tight">
              <AlertCircle size={18} className="text-rose-400 shrink-0" />
              Non-Performance Flags: Chapters ({nonPerformingChapters.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Chapters flagged for zero total chapter giving AND zero souls won within the selected timeframe.
            </p>
            {nonPerformingChapters.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-4 text-center">
                All regional chapters are performing actively. No flags generated.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {nonPerformingChapters.map(chapter => (
                  <div key={chapter.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">{chapter.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">HQ: {chapter.headquarters}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-550/10 text-rose-400 border border-rose-500/10 rounded-lg text-[9px] font-bold uppercase tracking-wider animate-pulse">
                      Underperforming
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Automate Non-Performance alerts */}
          <div className="p-6 border border-rose-500/15 bg-rose-500/5 rounded-3xl">
            <h3 className="text-md font-bold text-rose-450 flex items-center gap-2 mb-2 tracking-tight">
              <AlertTriangle size={18} className="animate-pulse" />
              Pastor Flagging Engine: Cell Deadlines & Giving Deficits
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
                      <span className="text-sm text-slate-205">{cell.cellName}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-extrabold uppercase ${cell.status === 'critical' ? 'bg-rose-500/15 text-rose-400' : 'bg-amber-500/15 text-amber-400'}`}>
                        {cell.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mb-3">
                      Chapter: <span className="font-semibold text-slate-400">{cell.chapterName}</span> <br />
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
        </div>
      )}

      {activeModule === 'audits' && (
        <div className="space-y-6">

          {/* Credential Approvals Queue */}
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl">
            <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 mb-4 tracking-tight">
              <UserCheck size={18} className="text-amber-500" />
              Two-Tier Credential Queue: Pending Pastor Confirmation
            </h3>
            {pendingCellLeaders.length > 0 ? (
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
                    {pendingCellLeaders.map(u => {
                      const creator = users.find(creatorUser => creatorUser.id === u.creatorId);
                      const chapter = chapters.find(ch => ch.id === u.chapterId);
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
                          <td className="px-4 py-3 text-slate-355 font-semibold">@{u.username}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-900/50 uppercase">{getRoleBadgeLabel(u.role)}</span>
                          </td>
                          <td className="px-4 py-3">
                            {chapter ? (
                              <>
                                <span className="text-indigo-400">{chapter.name}</span>
                                {cell && (
                                  <>
                                    {' '}
                                    &rarr; <span className="text-cyan-400">{cell.name}</span>
                                  </>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-500">Unassigned</span>
                            )}
                          </td>
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
                <span className="text-xs font-bold text-slate-400">All Leader Credentials Active</span>
                <span className="text-[10px] text-slate-550 mt-0.5">There are no pending Cell Leader credentials awaiting confirmation.</span>
              </div>
            )}
          </div>

          {/* Pending Deletions Queue */}
          {pendingDeletions.length > 0 && (
            <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-3xl">
              <h3 className="text-md font-bold text-rose-405 flex items-center gap-2 mb-4 tracking-tight">
                <AlertTriangle size={18} className="animate-pulse" />
                Pending Deletion Approval Requests (Chapter Leaders Authority)
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-rose-500/10 bg-slate-950/60">
                <table className="w-full border-collapse text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="border-b border-rose-500/10 text-slate-500 uppercase tracking-wider font-extrabold bg-slate-900/60 text-[10px]">
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
                              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-450 font-bold rounded-lg border border-emerald-500/20 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
                            >
                              <CheckCircle size={12} /> Confirm Delete
                            </button>
                            <button
                              onClick={() => rejectUserDeletion(u.id)}
                              className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-455 font-bold rounded-lg border border-rose-500/20 transition-colors flex items-center gap-1 active:scale-95 cursor-pointer"
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
            <div className="p-6 border border-indigo-500/15 bg-indigo-500/5 rounded-3xl">
              <h3 className="text-md font-bold text-indigo-400 flex items-center gap-2 mb-4 tracking-tight">
                <Sparkles size={18} />
                Souls Awaiting Pastor Confirmation ({pendingSouls.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSouls.map(soul => (
                  <div key={soul.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3 font-medium">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{soul.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900">{soul.sex}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Recorded by: <span className="text-slate-400 font-semibold">{soul.reporterName}</span> (Chapter Leader)</p>
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

          {/* Pastor Giving Verification Queue */}
          {pendingGivings.length > 0 && (
            <div className="p-6 border border-amber-500/15 bg-amber-500/5 rounded-3xl">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2 mb-4 tracking-tight">
                <AlertCircle size={18} />
                Financial Audit Queue: Pending Pastor Review ({pendingGivings.length})
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
                targetRole="chapter_leader"
                chapters={chapters}
                cells={cells}
                onSubmit={createCredential}
              />
            </div>
            
            {/* establish location / structure form */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl h-fit w-full lg:w-80 shadow-lg">
              <h3 className="text-sm font-bold text-slate-101 mb-2 flex items-center gap-2 tracking-tight">
                <Map size={16} className="text-indigo-400" />
                Establish New Location / Structure
              </h3>
              <p className="text-[10px] text-slate-450 leading-relaxed mb-4">
                Global Administration: Select a level to add a new Group Church, Chapter, or Fellowship Cell to the church directory.
              </p>
              {structureSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold">
                  Structure established successfully!
                </div>
              )}
              <form onSubmit={handleEstablishStructure} className="space-y-4">
                <div>
                  <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">Structure Type</label>
                  <select
                    value={structureType}
                    onChange={(e) => {
                      setStructureType(e.target.value);
                      setNewStructureName('');
                      setNewStructureHq('');
                      setNewStructureChapterId('');
                    }}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-101 rounded-xl text-xs outline-none"
                  >
                    {selectableStructureTypes.map(st => (
                      <option key={st.value} value={st.value} className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>{st.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-450 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">Structure Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Joy Fellowship"
                    value={newStructureName}
                    onChange={(e) => setNewStructureName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-100 rounded-xl text-xs outline-none"
                  />
                </div>

                {structureType === 'cell' && (
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">Parent Chapter Assignment</label>
                    <select
                      value={newStructureChapterId}
                      required
                      onChange={(e) => setNewStructureChapterId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-101 rounded-xl text-xs outline-none font-medium"
                    >
                      <option value="" className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>Select Chapter...</option>
                      {chapters.map(ch => (
                        <option key={ch.id} value={ch.id} className="bg-slate-900 text-slate-200" style={{ backgroundColor: '#0f172a', color: '#cbd5e1' }}>{ch.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-wide mb-1.5">Structure City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lagos"
                    value={newStructureHq}
                    onChange={(e) => setNewStructureHq(e.target.value)}
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
              users={users}
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
                        <td className="px-6 py-3 font-mono text-[10px] text-slate-500">{item.id}</td>
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

      {/* Exporter Reveal Modal is now rendered inline above */}

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
                  <div>Segment: <strong className="text-slate-200">{selectedReceipt.segment || 'Local'}</strong></div>
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
                <div className="w-full p-2.5 bg-emerald-550/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-bold text-center flex items-center justify-center gap-1.5">
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
export default AdminPortal;
