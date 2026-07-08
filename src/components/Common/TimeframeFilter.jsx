import React from 'react';
import { Calendar } from 'lucide-react';

export function TimeframeFilter({ value, onChange }) {
  const options = [
    { value: 'weekly', label: 'Weekly Summary (Last 7 Days)' },
    { value: 'monthly', label: 'Monthly Summary (Last 30 Days)' },
    { value: 'quarterly', label: 'Quarterly Summary (Last 90 Days)' },
    { value: 'half_year', label: 'Half-Yearly Summary (Last 180 Days)' },
    { value: 'full_year', label: 'Full Year Summary (Last 365 Days)' },
  ];

  return (
    <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
      <Calendar size={14} className="text-indigo-400" />
      <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mr-1">Timeframe:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-slate-200 text-xs font-bold outline-none cursor-pointer pr-2 focus:text-indigo-300 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200 font-medium">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
