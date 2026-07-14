import React, { useState } from 'react';
import { StatCard } from '../Common/StatCard';
import { LineChart } from '../Common/SvgCharts';
import { RecordGivingForm } from '../Common/RecordGivingForm';
import { RecordSoulForm } from '../Common/RecordSoulForm';
import { TimeframeFilter } from '../Common/TimeframeFilter';
import { UserAvatar } from '../Common/UserAvatar';
import { 
  TrendingUp, CheckCircle, XCircle, Clock, AlertCircle, Calendar, Sparkles, Award, FileText, Camera
} from 'lucide-react';

export function MemberPortal({ 
  currentUser, 
  users, 
  ledger, 
  chapters, 
  cells, 
  updateUser, 
  submitSoulRecord,
  submitLedgerEntry,
  souls,
  onEditProfile,
  activeModule = 'dashboard',
  globalSearchTerm = ''
}) {
  const [sundayInPerson, setSundayInPerson] = useState(currentUser.attendance?.sundayInPerson || false);
  const [wednesdayOnline, setWednesdayOnline] = useState(currentUser.attendance?.wednesdayOnline || false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [revealedReport, setRevealedReport] = useState(null); // 'givings' | 'souls' | 'submissions' | null
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
    
    if (diffDays < 0) return true;
    
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

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      attendance: {
        sundayInPerson,
        wednesdayOnline
      }
    });
    setAttendanceSuccess(true);
    setTimeout(() => setAttendanceSuccess(false), 2000);
  };

  const cellName = cells.find(c => c.id === currentUser.cellId)?.name || 'Unknown Cell';
  const chapterName = chapters.find(ch => ch.id === currentUser.chapterId)?.name || 'Unknown Chapter';

  // --- STATS & TRACKERS ---
  const mySubmissions = ledger.filter(item => item.memberId === currentUser.id);
  const myConfirmed = mySubmissions.filter(item => item.status === 'Confirmed');
  
  const mySubmissionsFiltered = mySubmissions.filter(item => filterByTimeframe(item.serviceDate));
  const myConfirmedFiltered = myConfirmed.filter(item => filterByTimeframe(item.serviceDate));
  
  const totalGiving = myConfirmedFiltered.reduce((sum, item) => sum + (item.amount || item.totalAmount || 0), 0);
  
  const soulsReporter = souls.filter(s => s.recordedBy === currentUser.id);
  const soulsReporterFiltered = soulsReporter.filter(s => s.status === 'Approved' && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const totalOutreach = myConfirmedFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + soulsReporterFiltered.length;

  const hasAttendance = currentUser.attendance?.sundayInPerson || currentUser.attendance?.wednesdayOnline;
  const isNonPerforming = totalGiving === 0 && !hasAttendance;

  const consistencyIndex = Math.min((myConfirmed.length / 4) * 100, 100);

  const myGivingTrend = [...myConfirmed]
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))
    .map(item => {
      const d = new Date(item.serviceDate);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return { label, value: item.amount || item.totalAmount || 0 };
    });

  const getStatusBadge = (status) => {
    if (status === 'Confirmed') return 'badge-emerald-soft';
    if (status === 'Pending_Cell_Review') return 'badge-amber-soft';
    return 'badge-rose-soft';
  };

  const getStatusIcon = (status) => {
    if (status === 'Confirmed') return <CheckCircle size={10} className="text-emerald-400" />;
    if (status === 'Pending_Cell_Review') return <Clock size={10} className="text-amber-400" />;
    return <XCircle size={10} className="text-rose-400" />;
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

  const filteredSubmissions = filterBySearch(mySubmissions, ['category', 'serviceDate', 'paymentMethod']);
  const filteredSouls = filterBySearch(souls.filter(s => s.status === 'Approved' && s.recordedBy === currentUser.id), ['name', 'sex', 'profession', 'phone']);

  return (
    <div className="space-y-6">
      
      {/* Welcome Bar / Rank Information (Member Indigo Theme) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-6 glass-panel rounded-3xl border-t-2 border-indigo-500/80">
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
            <span className="text-xs text-indigo-400 font-extrabold uppercase tracking-wide">Member (L6)</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-105 mt-1">
              {currentUser.title || 'Bro'} {currentUser.name}
            </h2>
            <p className="text-slate-400 text-xs mt-1">Cell: <span className="text-cyan-400 font-semibold">{cellName}</span> | Chapter: <span className="text-indigo-400 font-semibold">{chapterName}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
            <Award size={18} className="text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Consistency Index</span>
              <span className="text-xs font-extrabold text-slate-100">{consistencyIndex}% Stable</span>
            </div>
          </div>
        </div>
      </div>

      {activeModule === 'dashboard' && (
        <>
          {isNonPerforming && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl flex items-center gap-3 text-rose-400">
              <AlertCircle className="shrink-0 animate-pulse" size={18} />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Non-Performance Alert</h4>
                <p className="text-[11px] text-rose-300 font-medium mt-0.5">
                  You are currently flagged as a Non-Performing Member to your Cell Leader for this timeframe because you have no confirmed giving records and no service attendance checked.
                </p>
              </div>
            </div>
          )}

          {/* Timeframe Filter */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2 bg-slate-900/20 p-4 rounded-3xl border border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-100 tracking-tight">My Overview & Analytics</h3>
              <p className="text-[10px] text-slate-550 font-semibold tracking-wider uppercase">Filter personal stats by timeframe</p>
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
              title="My Total Giving"
              value={`$${totalGiving.toLocaleString()}`}
              icon={TrendingUp}
              description="Double-click to reveal your giving transaction history"
              status="info"
              onClick={() => setRevealedReport('givings')}
            />
            <StatCard
              title="Outreach Souls Won"
              value={`${totalOutreach} Souls`}
              icon={Sparkles}
              description="Double-click to reveal weekly outreach report logs"
              status="success"
              onClick={() => setRevealedReport('souls')}
            />
            <StatCard
              title="Total Submissions"
              value={`${mySubmissions.length} Entries`}
              icon={FileText}
              description="Double-click to reveal status review updates for all logs"
              status="default"
              onClick={() => setRevealedReport('submissions')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Consistency Trend Chart */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" />
                Personal Giving Trend
              </h3>
              <p className="text-xs text-slate-500 mb-4">Confirmed weekly giving records over time.</p>
              {myGivingTrend.length > 0 ? (
                <div className="h-40 flex items-center">
                  <LineChart data={myGivingTrend} strokeColor="#6366f1" />
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-10 text-center">
                  Confirmations will populate giving chart trend lines.
                </div>
              )}
            </div>

            {/* Weekly Attendance Check-in Card */}
            <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl shadow-lg">
              <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Calendar size={16} className="text-indigo-400" />
                Weekly Service Check-in
              </h3>
              <p className="text-xs text-slate-500 mb-4">Let your fellowship leaders know you participated in services this week.</p>
              
              {attendanceSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs rounded-xl font-bold flex items-center gap-2">
                  <CheckCircle size={14} /> Attendance Checked-in!
                </div>
              )}

              <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={sundayInPerson}
                      onChange={(e) => setSundayInPerson(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-650 bg-slate-900 border-slate-800 focus:ring-indigo-500 focus:ring-1 focus:ring-offset-slate-950 accent-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Sunday In-Person Service</span>
                      <span className="text-[10px] text-slate-550 block font-medium">Attended Sunday weekly church service</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={wednesdayOnline}
                      onChange={(e) => setWednesdayOnline(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-650 bg-slate-900 border-slate-800 focus:ring-indigo-500 focus:ring-1 focus:ring-offset-slate-950 accent-indigo-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-200 block">Wednesday Online Service</span>
                      <span className="text-[10px] text-slate-550 block font-medium">Joined online midweek fellowship service</span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all border-none cursor-pointer"
                >
                  Submit Check-in
                </button>
              </form>
            </div>
          </div>
        </>
      )}

      {activeModule === 'ledger' && (
        <div className="p-6 glass-panel rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-md font-bold text-slate-100 flex items-center gap-2 tracking-tight">
                <FileText size={16} className="text-indigo-500" />
                My Submission Logs & History
              </h3>
              <p className="text-xs text-slate-500">Log history of weekly contributions and cell auditing verification status.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportToTxt('My Submission History', ['ID', 'Category', 'Segment', 'Method', 'Date', 'Amount', 'Status'], mySubmissions.map(item => [item.id, item.category, item.segment || 'Local', item.paymentMethod, item.serviceDate, `$${item.amount || item.totalAmount}`, item.status]))}
                className="px-3.5 py-1.5 bg-slate-950 border border-slate-800 text-slate-350 font-bold rounded-xl text-xs hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
              >
                Export TXT
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:hidden">
            {/* Mobile stacked card design */}
            {filteredSubmissions.map(item => (
              <div key={item.id} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-mono">#{item.id}</span>
                  <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase flex items-center gap-1 ${getStatusBadge(item.status)}`}>
                    {getStatusIcon(item.status)}
                    {item.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-end border-b border-slate-900 pb-2">
                  <div>
                    <span className="text-slate-100 font-bold text-sm block">${(item.amount || item.totalAmount).toLocaleString()}</span>
                    <span className="text-indigo-400 font-bold text-[10px] uppercase">{item.category}</span>
                  </div>
                  <span className="text-slate-400 font-mono font-medium">{item.serviceDate}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-semibold text-[10px]">
                  <span>Segment: {item.segment || 'Local'}</span>
                  <span>Method: {item.paymentMethod}</span>
                </div>
              </div>
            ))}
            {filteredSubmissions.length === 0 && (
              <div className="text-center text-slate-500 italic py-6">No records found.</div>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                  <th className="px-6 py-3.5">Transaction ID</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Service Date</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Segment</th>
                  <th className="px-6 py-3.5 text-right">Amount</th>
                  <th className="px-6 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {filteredSubmissions.map(item => (
                  <tr key={item.id} className="ledger-row">
                    <td className="px-6 py-3 font-mono text-[10px] text-slate-550">{item.id}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${item.category === 'Tithe' ? 'badge-indigo-soft' : 'badge-slate-soft'}`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-mono text-slate-400">{item.serviceDate}</td>
                    <td className="px-6 py-3 text-slate-450">{item.paymentMethod}</td>
                    <td className="px-6 py-3 text-slate-450">{item.segment || 'Local'}</td>
                    <td className="px-6 py-3 text-right text-indigo-400 font-bold font-mono tabular-nums">${(item.amount || item.totalAmount).toLocaleString()}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase ${getStatusBadge(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredSubmissions.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-slate-650 py-12 italic">No submission records found matching search parameters.</td>
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
                <Sparkles size={16} className="text-indigo-500" />
                My Soul Outreach Tracker
              </h3>
              <p className="text-xs text-slate-500">Listing of approved souls won and recorded under your membership scope.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-550 border-b border-slate-800 font-extrabold uppercase bg-slate-900/40 text-[10px] tracking-wider">
                    <th className="px-6 py-3.5">Soul Name</th>
                    <th className="px-6 py-3.5">Sex</th>
                    <th className="px-6 py-3.5">Profession</th>
                    <th className="px-6 py-3.5">Phone Number</th>
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
                      <td className="px-6 py-3 font-mono text-slate-455">{soul.phone}</td>
                    </tr>
                  ))}
                  {filteredSouls.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center text-slate-650 py-12 italic">No outreach additions recorded. Use Outreach form to add.</td>
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
            <AlertCircle size={18} className="text-rose-455 shrink-0" />
            Performance Deficit Report Status
          </h3>
          {isNonPerforming ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Your account is currently flagged as <span className="text-rose-400 font-bold">Inactive / Non-Performing</span> for this period.
              </p>
              <div className="p-4 bg-slate-950 border border-slate-850 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <XCircle size={14} /> Zero Confirmed Giving Contributions
                </div>
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <XCircle size={14} /> Missed In-Person / Midweek Online Service Attendance Check-in
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                To clear this flag, submit your weekly offerings using the Audit Portal inputs and complete your weekly service check-in forms.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/30 text-emerald-400 text-xs rounded-xl font-semibold flex items-center gap-2">
              <CheckCircle size={16} /> Your account metrics are optimal! You are in full active performance standing.
            </div>
          )}
        </div>
      )}

      {activeModule === 'audits' && (
        <div className="max-w-3xl">
          <RecordGivingForm
            currentUser={currentUser}
            onSubmit={submitLedgerEntry}
            onUpdateUser={updateUser}
            showAttendance={false}
            showNewSouls={true}
          />
        </div>
      )}

      {/* Member Analytics Reveal Modal */}
      {revealedReport && (() => {
        let reportTitle = '';
        let headers = [];
        let rows = [];

        if (revealedReport === 'givings') {
          reportTitle = 'My Personal Confirmed Givings Report';
          headers = ['Category', 'Segment', 'Payment Method', 'Amount', 'Date & Time'];
          rows = myConfirmedFiltered.map(item => [
            item.category || 'Tithe',
            item.segment || 'Local',
            item.paymentMethod,
            `$${item.amount || item.totalAmount}`,
            new Date(item.createdAt).toLocaleString()
          ]);
        } else if (revealedReport === 'souls') {
          reportTitle = 'My Personal Soul-Winning Outreach Report';
          headers = ['Service Date', 'Souls Won', 'Verification Status', 'Submission Date'];
          rows = mySubmissionsFiltered
            .filter(item => item.newMembersBroughtIn > 0)
            .map(item => [
              item.serviceDate,
              `+${item.newMembersBroughtIn}`,
              item.status.replace(/_/g, ' '),
              new Date(item.createdAt).toLocaleString()
            ]);
        } else if (revealedReport === 'submissions') {
          reportTitle = 'My Submission Log History Audit Report';
          headers = ['Category', 'Segment', 'Amount', 'Uploaded At', 'Verification Status'];
          rows = mySubmissionsFiltered.map(item => [
            item.category || 'Tithe',
            item.segment || 'Local',
            `$${item.amount || item.totalAmount}`,
            new Date(item.createdAt).toLocaleString(),
            item.status.replace(/_/g, ' ')
          ]);
        }

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between p-6 border-b border-slate-850 bg-slate-900/10">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{reportTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Summary of personal transaction records and submission logs</p>
                </div>
                <button
                  onClick={() => setRevealedReport(null)}
                  className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-90 shrink-0 text-lg font-bold"
                  aria-label="Close modal"
                >
                  &times;
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="overflow-x-auto rounded-2xl border border-slate-850 bg-slate-950/40">
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

              <div className="flex items-center justify-between p-6 border-t border-slate-850 bg-slate-955/20">
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
            </div>
          </div>
        );
      })()}
    </div>
  );
}
export default MemberPortal;
