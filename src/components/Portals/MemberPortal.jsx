import React, { useState, useEffect } from 'react';
import { StatCard } from '../Common/StatCard';
import { LineChart } from '../Common/SvgCharts';
import { 
  TrendingUp, Calendar, Send, CheckCircle2, Clock, 
  XCircle, FileText, Upload, Sparkles, Award, AlertCircle, Camera
} from 'lucide-react';
import { RecordGivingForm } from '../Common/RecordGivingForm';
import { RecordSoulForm } from '../Common/RecordSoulForm';
import { TimeframeFilter } from '../Common/TimeframeFilter';
import { UserAvatar } from '../Common/UserAvatar';

export function MemberPortal({ currentUser, ledger, chapters, cells, submitLedgerEntry, updateUser, submitSoulRecord, souls, onEditProfile }) {
  // Attendance State
  const initialAttendance = currentUser.attendance || { sundayInPerson: false, wednesdayOnline: false };
  const [sundayInPerson, setSundayInPerson] = useState(initialAttendance.sundayInPerson);
  const [wednesdayOnline, setWednesdayOnline] = useState(initialAttendance.wednesdayOnline);
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

  // Auto-fill attendance
  useEffect(() => {
    const att = currentUser.attendance || { sundayInPerson: false, wednesdayOnline: false };
    setSundayInPerson(att.sundayInPerson);
    setWednesdayOnline(att.wednesdayOnline);
  }, [currentUser]);

  const handleAttendanceSubmit = (e) => {
    e.preventDefault();
    setAttendanceSuccess(false);
    updateUser(currentUser.id, {
      attendance: { sundayInPerson, wednesdayOnline }
    });
    setAttendanceSuccess(true);
    setTimeout(() => setAttendanceSuccess(false), 2000);
  };

  const cellName = cells.find(c => c.id === currentUser.cellId)?.name || 'Unknown Cell';
  const chapterName = chapters.find(ch => ch.id === currentUser.chapterId)?.name || 'Unknown Chapter';

  // --- STATS & TRACKERS ---
  const mySubmissions = ledger.filter(item => item.memberId === currentUser.id);
  const myConfirmed = mySubmissions.filter(item => item.status === 'Confirmed');
  
  // Filtered by selected timeframe
  const mySubmissionsFiltered = mySubmissions.filter(item => filterByTimeframe(item.serviceDate));
  const myConfirmedFiltered = myConfirmed.filter(item => filterByTimeframe(item.serviceDate));
  
  const totalGiving = myConfirmedFiltered.reduce((sum, item) => sum + (item.amount || item.totalAmount || 0), 0);
  
  const soulsReporter = souls.filter(s => s.recordedBy === currentUser.id);
  const soulsReporterFiltered = soulsReporter.filter(s => s.status === 'Approved' && filterByTimeframe(s.recordedAt || s.createdAt || new Date()));
  const totalOutreach = myConfirmedFiltered.reduce((sum, item) => sum + item.newMembersBroughtIn, 0) + soulsReporterFiltered.length;

  const hasAttendance = currentUser.attendance?.sundayInPerson || currentUser.attendance?.wednesdayOnline;
  const isNonPerforming = totalGiving === 0 && !hasAttendance;

  // Compute consistency (active weeks in mock dashboard)
  const consistencyIndex = Math.min((myConfirmed.length / 4) * 100, 100);

  // Weekly Giving trend chart data
  const myGivingTrend = [...myConfirmed]
    .sort((a, b) => a.serviceDate.localeCompare(b.serviceDate))
    .map(item => {
      const d = new Date(item.serviceDate);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
      return { label, value: item.amount || item.totalAmount || 0 };
    });

  const getStatusBadge = (status) => {
    if (status === 'Confirmed') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'Pending_Cell_Review') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  const getStatusIcon = (status) => {
    if (status === 'Confirmed') return <CheckCircle2 size={12} className="text-emerald-400" />;
    if (status === 'Pending_Cell_Review') return <Clock size={12} className="text-amber-400" />;
    return <XCircle size={12} className="text-rose-400" />;
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
            <span className="text-xs text-emerald-400 font-extrabold uppercase tracking-wider">Member Portal</span>
            <h2 className="text-2xl font-extrabold text-slate-100 mt-1">
              {currentUser.title || 'Bro'} {currentUser.name}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Cell: <span className="text-indigo-300 font-bold">{cellName}</span> | Chapter: <span className="text-indigo-300 font-bold">{chapterName}</span></p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
            <Award size={18} className="text-indigo-400" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Consistency Index</span>
              <span className="text-sm font-extrabold text-slate-100">{consistencyIndex}% Stable</span>
            </div>
          </div>
        </div>
      </div>

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

      {/* Timeframe Filter for Metrics & Summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div className="text-xs text-slate-500 font-extrabold uppercase tracking-wider">
          My Overview & Analytics Summary
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
          description="Click to reveal your giving transaction history"
          status="info"
          onClick={() => setRevealedReport('givings')}
        />
        <StatCard
          title="Outreach Souls Won"
          value={`${totalOutreach} Souls`}
          icon={Sparkles}
          description="Click to reveal weekly outreach report logs"
          status="success"
          onClick={() => setRevealedReport('souls')}
        />
        <StatCard
          title="Total Submissions"
          value={`${mySubmissions.length} Entries`}
          icon={FileText}
          description="Click to reveal status review updates for all logs"
          status="default"
          onClick={() => setRevealedReport('submissions')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Weekly Submission Form */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <RecordGivingForm
            currentUser={currentUser}
            onSubmit={submitLedgerEntry}
            onUpdateUser={updateUser}
            showAttendance={false}
            showNewSouls={true}
          />
          <RecordSoulForm
            currentUser={currentUser}
            chapters={chapters}
            cells={cells}
            onSubmit={submitSoulRecord}
          />
        </div>

        {/* Right: Personal Growth Tracker */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Consistency Trend Chart */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 sm:p-6 rounded-3xl">
            <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-400" />
              Personal Giving Trend
            </h3>
            <p className="text-xs text-slate-500 mb-4">Confirmed weekly giving records over time.</p>
            {myGivingTrend.length > 0 ? (
              <div className="h-40 flex items-center">
                <LineChart data={myGivingTrend} strokeColor="#10b981" />
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic py-10 text-center">
                Confirmations will populate giving chart trend lines.
              </div>
            )}
          </div>

          {/* Weekly Attendance Check-in Card */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-lg">
            <h3 className="text-md font-bold text-slate-100 mb-2 flex items-center gap-2">
              <Calendar size={16} className="text-indigo-400" />
              Weekly Service Check-in
            </h3>
            <p className="text-xs text-slate-500 mb-4">Let your fellowship leaders know you participated in services this week.</p>
            
            {attendanceSuccess && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 size={14} /> Attendance Checked-in!
              </div>
            )}

            <form onSubmit={handleAttendanceSubmit} className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={sundayInPerson}
                    onChange={(e) => setSundayInPerson(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-650 bg-slate-900 border-slate-800 focus:ring-indigo-500 focus:ring-1 focus:ring-offset-slate-955 accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Sunday In-Person Service</span>
                    <span className="text-[10px] text-slate-500 block">Attended Sunday weekly church service</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-slate-955 border border-slate-850 rounded-xl cursor-pointer hover:border-slate-700 transition-all select-none">
                  <input
                    type="checkbox"
                    checked={wednesdayOnline}
                    onChange={(e) => setWednesdayOnline(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-650 bg-slate-900 border-slate-800 focus:ring-indigo-500 focus:ring-1 focus:ring-offset-slate-955 accent-indigo-600"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">Wednesday Online Service</span>
                    <span className="text-[10px] text-slate-500 block">Joined online midweek fellowship service</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-indigo-900/10"
              >
                Submit Check-in
              </button>
            </form>
          </div>

          {/* Submission Status List */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl max-h-96 overflow-y-auto">
            <h3 className="text-md font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-amber-400" />
              Submission Log & History
            </h3>

            {mySubmissions.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-6 text-center">No submissions recorded yet.</div>
            ) : (
              <div className="space-y-3">
                {mySubmissions.map(item => (
                  <div key={item.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-105">${item.amount || item.totalAmount}</strong>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-900/50 font-bold uppercase">{item.category || 'Contribution'}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Service: {item.serviceDate} • {item.segment || 'Local'}</span>
                      <span className="text-[9px] text-slate-450 block font-semibold">Uploaded: {new Date(item.createdAt).toLocaleString()}</span>
                      {item.description && (
                        <span className="text-[10px] text-slate-400 italic mt-0.5">"{item.description}"</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{item.paymentMethod}</span>
                      <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold uppercase flex items-center gap-1 ${getStatusBadge(item.status)}`}>
                        {getStatusIcon(item.status)}
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
            <div className="bg-slate-905 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-slate-850">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">{reportTitle}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Summary of personal transaction records and submission logs</p>
                </div>
                <button
                  onClick={() => setRevealedReport(null)}
                  className="text-slate-400 hover:text-slate-205 text-xl font-bold p-1 rounded-lg"
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
export default MemberPortal;
