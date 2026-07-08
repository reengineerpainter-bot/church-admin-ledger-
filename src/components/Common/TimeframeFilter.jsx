import React from 'react';
import { Calendar } from 'lucide-react';

export function TimeframeFilter({ value, onChange, customStart, onChangeStart, customEnd, onChangeEnd }) {
  const options = [
    { value: 'weekly', label: 'Weekly Summary (Last 7 Days)' },
    { value: 'monthly', label: 'Monthly Summary (Last 30 Days)' },
    { value: 'quarterly', label: 'Quarterly Summary (Last 90 Days)' },
    { value: 'half_year', label: 'Half-Yearly Summary (Last 180 Days)' },
    { value: 'full_year', label: 'Full Year Summary (Last 365 Days)' },
    { value: 'custom', label: 'Custom Period...' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-900/60 border border-slate-800 p-2 rounded-xl shrink-0 select-none">
      <div className="flex items-center gap-1">
        <Calendar size={14} className="text-indigo-400" />
        <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1">Timeframe:</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-slate-200 text-xs font-bold outline-none cursor-pointer pr-2 focus:text-indigo-300 transition-colors"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-955 text-slate-200 font-medium">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {value === 'custom' && (
        <div className="flex items-center gap-2 border-l border-slate-800 pl-2 animate-fade-in">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onChangeStart(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2 py-0.5 outline-none focus:border-indigo-500"
          />
          <span className="text-slate-500 text-[10px] font-bold uppercase">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onChangeEnd(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2 py-0.5 outline-none focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
}
