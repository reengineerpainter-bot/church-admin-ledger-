import React, { useState } from 'react';
import { StatCard } from '../Common/StatCard';
import { CredentialForm } from './CredentialForm';
import { UserDirectory } from './UserDirectory';
import { 
  TrendingUp, Users, CheckCircle, XCircle, UserPlus, 
  UserCheck, AlertCircle, FileText, Eye, Calendar, Trophy, Sparkles, Camera, Wallet
} from 'lucide-react';
import { RecordGivingForm } from '../Common/RecordGivingForm';
import { RecordSoulForm } from '../Common/RecordSoulForm';
import { TimeframeFilter } from '../Common/TimeframeFilter';
import { UserAvatar } from '../Common/UserAvatar';

export function CellPortal({ 
  currentUser, 
  users, 
  ledger, 
  chapters, 
  cells, 
  createCredential, 
  verifyLedgerEntry,
  updateUser,
  submitSoulRecord,
  approveSoul,
  rejectSoul,
  submitLedgerEntry,
  souls,
  onEditProfile,
  activeModule = 'dashboard',
  globalSearchTerm = ''
}) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [revealedReport, setRevealedReport] = useState(null); // 'givings' | 'souls' | 'members' | null
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

  const cellId = currentUser.cellId;
  const cellName = cells.find(c => c.id === cellId)?.name || 'Unknown Cell';
  const chapterName = chapters.find(ch => ch.id === currentUser.chapterId)?.name || 'Unknown Chapter';

  // --- CELL ISOLATION FILTERS ---
  const cellUsers = users.filter(u => u.cellId === cellId && u.role === 'member');
  const activeMembers = cellUsers.filter(u => u.status === 'Active');
  
  const cellLedger = ledger.filter(item => item.cellId === cellId || item.memberId === currentUser.id);
  const confirmedLedger = cellLedger.filter(item => item.status === 'Confirmed');

  // --- STATS COMPUTATIONS ---
  const cellLedgerFiltered = cellLedger.filter(item => filterByTimeframe(item.serviceDate));
  const confirmedLedgerFiltered = confirmedLedger.filter(item => filterByTimeframe(item.serviceDate));
  
  const totalCellGiving = confirmedLedgerFiltered.reduce((sum, item) => sum + item.totalAmount, 0);
  
  const soulsFiltered = souls.filter(s => s.status === 'Approved' && s.cellId === cellId && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const totalCellSouls = confirmedLedgerFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + soulsFiltered.length;

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

  // Evaluate underperforming cell members
  const nonPerformingMembers = activeMembers.filter(member => {
    const memberGiving = confirmedLedgerFiltered
      .filter(item => item.memberId === member.id)
      .reduce((sum, item) => sum + item.totalAmount, 0);
    
    const hasAttendance = member.attendance?.sundayInPerson || member.attendance?.wednesdayOnline;
    return memberGiving === 0 && !hasAttendance;
  });

  // --- FINANCIAL VERIFICATION QUEUE ---
  const pendingSubmissions = cellLedger.filter(item => item.status === 'Pending_Cell_Review');

  // Souls pending approval under this Cell Leader
  const pendingSouls = souls.filter(s => {
    if (s.status !== 'Pending_Approval') return false;
    const reporter = users.find(u => u.id === s.recordedBy);
    return reporter && reporter.role === 'member' && reporter.cellId === cellId;
  });

  // --- MEMBER ASSESSMENT LEDGER ---
  const memberAssessment = activeMembers.map(member => {
    const memberSubmissions = cellLedger.filter(item => item.memberId === member.id);
    const confirmedSubs = memberSubmissions.filter(item => item.status === 'Confirmed');
    const memberGiving = confirmedSubs.reduce((sum, item) => sum + (item.amount || item.totalAmount || 0), 0);
    const memberSouls = confirmedSubs.reduce((sum, item) => sum + item.newMembersBroughtIn, 0);

    // Consistency rating based on submissions in the last 4 weeks
    const submissionRatio = Math.min((confirmedSubs.length / 4) * 100, 100);
    let consistency = 'Optimal';
    if (submissionRatio < 50) consistency = 'Needs Attention';
    else if (submissionRatio < 75) consistency = 'Irregular';

    return {
      id: member.id,
      name: member.name,
      username: member.username,
      attendance: member.attendance || { sundayInPerson: false, wednesdayOnline: false },
      totalEntries: memberSubmissions.length,
      confirmedGiving: memberGiving,
      soulsWon: memberSouls,
      consistency,
      ratio: submissionRatio
    };
  });

  const getConsistencyBadge = (status) => {
    if (status === 'Optimal') return 'badge-emerald-soft';
    if (status === 'Irregular') return 'badge-amber-soft';
    return 'badge-rose-soft';
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

  const filteredAssessment = filterBySearch(memberAssessment, ['name', 'username', 'consistency']);
  const filteredSouls = filterBySearch(souls.filter(s => s.status === 'Approved' && s.cellId === cellId), ['name', 'sex', 'reporterName', 'profession', 'phone']);

  return (
    <div className="space-y-6">
      
      {/* Welcome Bar / Level Info (Cell Leader Cyan Theme) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 glass-panel rounded-3xl border-t-2 border-cyan-500/60">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onDoubleClick={onEditProfile}
            className="relative group rounded-2xl overflow-hidden hover:scale-105 active:scale-95 transition-all ring-4 ring-cyan-500/10 shrink-0 border-none cursor-pointer p-0"
            title="Double-click to Edit Profile"
          >
            <UserAvatar user={currentUser} size="lg" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera size={16} />
            </div>
          </button>
          <div>
            <span className="text-xs text-cyan-400 font-extrabold uppercase tracking-wide">Cell Leader (L5) &rarr; {cellName}</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight mt-1 bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">{chapterName} &rarr; Cell Group</h2>
            <p className="text-slate-400 text-xs mt-1">Audit weekly member receipt uploads and provision member credentials.</p>
          </div>
        </div>
      </div>

      {activeModule === 'dashboard' && (
        <>
          {/* Timeframe Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 bg-slate-900/20 p-4 rounded-3xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">Cell Overview & Analytics</h3>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Filter fellowship statistics by period</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Cell Total Giving"
              value={`$${totalCellGiving.toLocaleString()}`}
              icon={TrendingUp}
              description={`Double-click to reveal giving contributors in ${cellName}`}
              status="info"
              onClick={() => setRevealedReport('givings')}
            />
            <StatCard
              title="Cell Souls Won"
              value={totalCellSouls}
              icon={Trophy}
              description="Double-click to reveal member outreach tallies"
              status="success"
              onClick={() => setRevealedReport('souls')}
            />
            <StatCard
              title="Supervised Members"
              value={activeMembers.length}
              icon={Users}
              description={`Double-click to reveal attendance check-in status details`}
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
                description="Your Tithes and Offering receipts confirmed"
                status="info"
              />
              <StatCard
                title="My Personal Outreach"
                value={`${myPersonalSouls} Souls`}
                icon={Sparkles}
                description="Approved souls brought by you"
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
        </>
      )}

      {activeModule === 'ledger' && (
        <div className="p-6 glass-panel rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                <FileText size={16} className="text-cyan-500" />
                Member Assessment Ledger
              </h3>
              <p className="text-xs text-slate-500">Weekly giving activity, attendance consistency, and cell growth metrics.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToTxt('Cell Member Assessment Ledger', ['Name', 'Username', 'Total Entries', 'Giving', 'Souls Won', 'Consistency'], memberAssessment.map(m => [m.name, `@${m.username}`, m.totalEntries, `$${m.confirmedGiving}`, m.soulsWon, m.consistency]))}
                className="px-3 py-1.5 bg-slate-950 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                Export TXT
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse min-w-[700px]">
              <thead>
                <tr className="text-slate-550 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                  <th className="px-4 py-3">Member Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3 text-center">Sunday In-Person</th>
                  <th className="px-4 py-3 text-center">Wednesday Online</th>
                  <th className="px-4 py-3 text-center">Submissions (Last 4 Weeks)</th>
                  <th className="px-4 py-3">Consistency Level</th>
                  <th className="px-4 py-3 text-right">Confirmed Giving</th>
                  <th className="px-4 py-3 text-right">Souls Won</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {filteredAssessment.map(member => (
                  <tr 
                    key={member.id} 
                    className="ledger-row transition-all duration-200"
                  >
                    <td className="px-4 py-3 text-slate-100 font-bold">{member.name}</td>
                    <td className="px-4 py-3 text-slate-450">@{member.username}</td>
                    <td className="px-4 py-3 text-center">
                      {member.attendance.sundayInPerson ? (
                        <span className="px-2 py-0.5 rounded badge-emerald-soft text-[9px] font-bold uppercase">Attended</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded badge-slate-soft text-[9px] font-bold uppercase">Absent</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.attendance.wednesdayOnline ? (
                        <span className="px-2 py-0.5 rounded badge-emerald-soft text-[9px] font-bold uppercase">Joined</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded badge-slate-soft text-[9px] font-bold uppercase">Absent</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-semibold text-slate-350 font-mono tabular-nums">{member.totalEntries} weeks</span>
                        <span className="text-[10px] text-slate-500 font-mono">({member.ratio}%)</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] px-2 py-0.5 border rounded uppercase font-bold ${getConsistencyBadge(member.consistency)}`}>
                        {member.consistency}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-indigo-400 font-bold font-mono tabular-nums">${member.confirmedGiving.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-bold font-mono tabular-nums">+{member.soulsWon} Souls</td>
                  </tr>
                ))}
                {filteredAssessment.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center text-slate-600 py-10 italic">No cell member records found matching active filters.</td>
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
                <Trophy size={16} className="text-cyan-500" />
                Cell Soul Outreach Tracker
              </h3>
              <p className="text-xs text-slate-500">Outreach database additions recorded inside {cellName}.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                    <th className="px-6 py-3.5">Soul Name</th>
                    <th className="px-6 py-3.5">Sex</th>
                    <th className="px-6 py-3.5">Profession</th>
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
                      <td className="px-6 py-3 font-mono text-slate-450">{soul.phone}</td>
                      <td className="px-6 py-3 text-slate-350">{soul.reporterName}</td>
                    </tr>
                  ))}
                  {filteredSouls.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-slate-650 py-12 italic">No outreach records match search constraints.</td>
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
        <div className="p-6 border border-rose-500/10 bg-rose-500/5 rounded-3xl">
          <h3 className="text-md font-bold text-rose-400 flex items-center gap-2 mb-2 tracking-tight">
            <AlertCircle size={18} className="text-rose-450 shrink-0 animate-pulse" />
            Non-Performance Flags: Cell Members ({nonPerformingMembers.length})
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Registered cell members flagged for zero confirmed giving records AND zero attendance check-ins within the selected timeframe.
          </p>
          {nonPerformingMembers.length === 0 ? (
            <div className="text-xs text-slate-500 italic py-4 text-center">
              All active cell members are performing actively. No flags generated.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {nonPerformingMembers.map(member => (
                <div key={member.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-205 block">{member.name}</span>
                    <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">@{member.username}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-rose-550/10 text-rose-400 border border-rose-500/10 rounded-lg text-[9px] font-bold uppercase tracking-wider animate-pulse">
                    Inactive Flag
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeModule === 'audits' && (
        <div className="space-y-6">

          {/* Pending Submissions Queue */}
          {pendingSubmissions.length > 0 && (
            <div className="p-6 border border-amber-500/15 bg-amber-500/5 rounded-3xl">
              <h3 className="text-md font-bold text-amber-400 flex items-center gap-2 mb-4 tracking-tight">
                <AlertCircle size={18} />
                Financial Audit Queue: Pending Cell Review
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSubmissions.map(item => (
                  <div key={item.id} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
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
                          <span className="text-slate-555 font-semibold">Giving Segment:</span>
                          <span className="text-slate-205 font-bold">{item.segment || 'Local'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-semibold">Giving Category:</span>
                          <span className="text-[10px] px-2 py-0.5 rounded badge-indigo-soft font-bold uppercase">{item.category || 'Tithe'}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-slate-850 pt-2 text-indigo-400 font-bold">
                          <span>Total Amount:</span>
                          <span className="font-mono tabular-nums">${item.amount || item.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-slate-900 pt-3">
                      <button
                        onClick={() => setSelectedReceipt(item)}
                        className="flex items-center justify-center gap-1.5 py-1.5 border border-indigo-500/20 bg-indigo-500/5 text-indigo-455 hover:bg-indigo-500/10 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        <Eye size={12} /> View Proof of Payment Receipt
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => verifyLedgerEntry(item.id, true)}
                          className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer border-none"
                        >
                          <CheckCircle size={12} /> Confirm Receipt
                        </button>
                        <button
                          onClick={() => verifyLedgerEntry(item.id, false)}
                          className="px-3 py-1.5 border border-rose-500/30 hover:bg-rose-500/10 text-rose-455 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Souls Pending Verification Queue */}
          {pendingSouls.length > 0 && (
            <div className="p-6 border border-indigo-500/15 bg-indigo-500/5 rounded-3xl">
              <h3 className="text-md font-bold text-indigo-400 flex items-center gap-2 mb-4 tracking-tight">
                <Sparkles size={18} />
                Souls Awaiting Confirmation ({pendingSouls.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingSouls.map(soul => (
                  <div key={soul.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex flex-col justify-between gap-3 font-medium">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-205">{soul.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900">{soul.sex}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">Recorded by: <span className="text-slate-400 font-semibold">{soul.reporterName}</span></p>
                      <div className="mt-2 text-xs space-y-1 text-slate-455 border-t border-slate-900 pt-2">
                        <p><span className="text-slate-500 font-semibold">Profession:</span> {soul.profession}</p>
                        <p><span className="text-slate-500 font-semibold">Phone:</span> {soul.phone}</p>
                        <p><span className="text-slate-500 font-semibold">Address:</span> {soul.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-slate-900 pt-2.5">
                      <button
                        onClick={() => approveSoul(soul.id)}
                        className="flex-1 py-1.5 bg-emerald-650 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] transition-colors cursor-pointer border-none"
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
        </div>
      )}

      {activeModule === 'access_control' && (
        <div className="space-y-6">
          <div className="max-w-3xl">
            <CredentialForm
              creatorRole={currentUser.role}
              targetRole="member"
              chapters={chapters}
              cells={cells}
              currentChapterId={currentUser.chapterId}
              currentCellId={cellId}
              onSubmit={createCredential}
            />
          </div>

          <div className="mt-6">
            <UserDirectory
              currentUser={currentUser}
              users={activeMembers}
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
                    <tr className="text-slate-550 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
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

      {/* Exporter modal */}
      {revealedReport && (() => {
        let reportTitle = '';
        let headers = [];
        let rows = [];

        if (revealedReport === 'givings') {
          reportTitle = `${cellName} Total Givings Audit Report`;
          headers = ['Member', 'Category', 'Segment', 'Method', 'Amount', 'Date & Time'];
          rows = [...cellLedger]
            .filter(item => item.status === 'Confirmed')
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .map(item => [
              item.memberName,
              item.category || 'Tithe',
              item.segment || 'Local',
              item.paymentMethod,
              `$${item.totalAmount}`,
              new Date(item.createdAt).toLocaleString()
            ]);
        } else if (revealedReport === 'souls') {
          reportTitle = `${cellName} Souls Won Outreach Report`;
          headers = ['Member Name', 'Souls Won', 'Date & Time'];
          rows = [...cellLedger]
            .filter(item => item.status === 'Confirmed' && item.newMembersBroughtIn > 0)
            .sort((a, b) => b.newMembersBroughtIn - a.newMembersBroughtIn)
            .map(item => [
              item.memberName,
              `+${item.newMembersBroughtIn}`,
              new Date(item.createdAt).toLocaleString()
            ]);
        } else if (revealedReport === 'members') {
          reportTitle = `${cellName} Supervised Members Attendance Report`;
          headers = ['Member Name', 'Username', 'Title', 'Sunday Attendance', 'Wednesday Attendance', 'Status'];
          rows = activeMembers.map(m => {
            const att = m.attendance || { sundayInPerson: false, wednesdayOnline: false };
            return [
              m.name,
              `@${m.username}`,
              m.title || 'Bro',
              att.sundayInPerson ? 'Attended' : 'Absent',
              att.wednesdayOnline ? 'Joined' : 'Absent',
              m.status
            ];
          });
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/10">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{reportTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Summary of cell fellowship contributors and growth breakdown</p>
                </div>
                <button
                  onClick={() => setRevealedReport(null)}
                  className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 shrink-0 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="text-slate-550 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                        {headers.map((h, i) => {
                          const isAmountHeader = h.toLowerCase().includes('amount') || h.toLowerCase().includes('souls') || h.toLowerCase().includes('giving');
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

              <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/20">
                <div className="text-[10px] text-slate-500 font-extrabold uppercase">Export Format Options:</div>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => exportToTxt(reportTitle, headers, rows)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-350 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
                  >
                    Download TXT
                  </button>
                  <button
                    onClick={() => exportToWord(reportTitle, headers, rows)}
                    className="px-3.5 py-2 bg-slate-950 border border-slate-800 text-slate-355 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
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
            </div>
          </div>
        );
      })()}

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
export default CellPortal;
