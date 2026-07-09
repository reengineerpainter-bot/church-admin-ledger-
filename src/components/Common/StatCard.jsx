import React from 'react';

export function StatCard({ title, value, icon: Icon, description, trend, status = 'default', onClick: onDoubleClick }) {
  const statusStyles = {
    success: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    danger: 'border-rose-500/20 bg-rose-500/5 text-rose-400',
    info: 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400',
    default: 'border-slate-800 bg-slate-900/60 text-slate-400'
  };

  const trendStyles = {
    up: 'text-emerald-400 bg-emerald-500/10',
    down: 'text-rose-400 bg-rose-500/10',
    neutral: 'text-slate-400 bg-slate-500/10'
  };

  return (
    <div 
      onDoubleClick={onDoubleClick}
      className={`p-5 rounded-2xl border transition-all duration-300 ${onDoubleClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-950/10 select-none' : ''} backdrop-blur-md ${statusStyles[status] || statusStyles.default}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl border border-current/15`}>
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-100">{value}</span>
        {trend && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${trendStyles[trend.type] || trendStyles.neutral}`}>
            {trend.type === 'up' ? '+' : ''}{trend.value}
          </span>
        )}
      </div>
      {description && (
        <p className="text-slate-500 text-xs mt-2 font-medium">
          {description.replace(/^(Click|click)/, 'Double-click')}
        </p>
      )}
    </div>
  );
}
export default StatCard;
