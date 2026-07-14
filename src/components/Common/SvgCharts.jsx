import React from 'react';

// Polar coordinate conversion for Donut slices
const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

const describeArc = (x, y, radius, startAngle, endAngle) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(' ');
};

export function LineChart({ data = [], height = 180, strokeColor = '#6366f1', fillColor }) {
  if (!data || data.length === 0) return <div className="text-slate-500 text-xs text-center py-10 italic">No data available</div>;

  const width = 500;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.value), 100);
  const minVal = 0;
  const range = maxVal - minVal;

  // Generate points
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / (range || 1)) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  // Construct path string
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
    }
  }

  // Construct area path string
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Y-axis gridlines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const y = paddingTop + chartHeight * ratio;
    const value = Math.round(maxVal - ratio * range);
    return { y, value };
  });

  // Unique gradient IDs to prevent conflicts
  const gradId = `areaGrad-${strokeColor.replace('#', '')}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
          <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.3" />
          </pattern>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor={strokeColor} floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Background Grid Pattern */}
        <rect x={paddingLeft} y={paddingTop} width={chartWidth} height={chartHeight} fill="url(#dotGrid)" />

        {/* Horizontal Gridlines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={line.y} 
              x2={width - paddingRight} 
              y2={line.y} 
              stroke="#1e293b" 
              strokeWidth="1.2" 
            />
            <text 
              x={paddingLeft - 10} 
              y={line.y + 3.5} 
              fill="#64748b" 
              fontSize="9" 
              fontWeight="600"
              fontFamily="monospace"
              textAnchor="end"
            >
              ${line.value.toLocaleString()}
            </text>
          </g>
        ))}

        {/* Area fill under curve */}
        {areaD && <path d={areaD} fill={`url(#${gradId})`} className="transition-all duration-300" />}

        {/* Smooth line */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#shadow)"
          />
        )}

        {/* Interactive points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            {/* Hover shadow ring */}
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="7" 
              fill={strokeColor} 
              opacity="0"
              className="transition-all duration-200 group-hover:opacity-20"
            />
            {/* Core point */}
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4" 
              fill="#0f172a" 
              stroke={strokeColor} 
              strokeWidth="2"
              className="transition-all duration-200"
            />
            {/* Custom Tooltip */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <rect
                x={p.x - 35}
                y={p.y - 30}
                width="70"
                height="20"
                rx="6"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="1"
              />
              <text
                x={p.x}
                y={p.y - 17}
                fill="#f8fafc"
                fontSize="9"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="monospace"
              >
                ${p.value.toLocaleString()}
              </text>
            </g>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, idx) => (
          <text 
            key={idx} 
            x={p.x} 
            y={height - 8} 
            fill="#64748b" 
            fontSize="9" 
            fontWeight="bold"
            textAnchor="middle"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function BarChart({ data = [], height = 180, barColor = '#10b981' }) {
  if (!data || data.length === 0) return <div className="text-slate-500 text-xs text-center py-10 italic">No data available</div>;

  const width = 500;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.value), 10);
  const gridLines = [0, 0.5, 1].map(ratio => {
    const y = paddingTop + chartHeight * ratio;
    const value = Math.round(maxVal * (1 - ratio));
    return { y, value };
  });

  const barCount = data.length;
  const barWidth = (chartWidth / barCount) * 0.5;
  const gap = (chartWidth / barCount) * 0.5;

  const barGradId = `barGrad-${barColor.replace('#', '')}`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none overflow-visible">
        <defs>
          <linearGradient id={barGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} stopOpacity="1" />
            <stop offset="100%" stopColor={barColor} stopOpacity="0.65" />
          </linearGradient>
          <pattern id="dotGridBar" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#334155" opacity="0.3" />
          </pattern>
        </defs>

        {/* Background Grid Pattern */}
        <rect x={paddingLeft} y={paddingTop} width={chartWidth} height={chartHeight} fill="url(#dotGridBar)" />

        {/* Gridlines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={line.y} 
              x2={width - paddingRight} 
              y2={line.y} 
              stroke="#1e293b" 
              strokeWidth="1.2"
            />
            <text 
              x={paddingLeft - 10} 
              y={line.y + 3.5} 
              fill="#64748b" 
              fontSize="9" 
              fontWeight="600"
              fontFamily="monospace"
              textAnchor="end"
            >
              ${line.value.toLocaleString()}
            </text>
          </g>
        ))}

        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingLeft + i * (barWidth + gap) + gap / 2;
          const barH = (d.value / maxVal) * chartHeight;
          const y = paddingTop + chartHeight - barH;

          return (
            <g key={i} className="group cursor-pointer">
              {/* Subtle background track for bars */}
              <rect 
                x={x} 
                y={paddingTop} 
                width={barWidth} 
                height={chartHeight} 
                fill="#1e293b" 
                opacity="0.15"
                rx="4"
              />
              {/* Actual bar */}
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={Math.max(barH, 3)} 
                fill={`url(#${barGradId})`} 
                rx="4"
                className="transition-all duration-200 hover:brightness-110"
              />
              {/* Tooltip on hover */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <rect
                  x={x + barWidth / 2 - 35}
                  y={y - 28}
                  width="70"
                  height="20"
                  rx="6"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="1"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 15}
                  fill="#f8fafc"
                  fontSize="9"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  ${d.value.toLocaleString()}
                </text>
              </g>
              {/* X label */}
              <text 
                x={x + barWidth / 2} 
                y={height - 8} 
                fill="#64748b" 
                fontSize="9" 
                fontWeight="bold"
                textAnchor="middle"
              >
                {d.label.length > 12 ? d.label.substring(0, 10) + '..' : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DonutChart({ data = [], size = 200, strokeWidth = 16 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size - strokeWidth - 25) / 2;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg width={size} height={size}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
          <text x={center} y={center} fill="#475569" textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold font-mono">NO RECORDS</text>
        </svg>
      </div>
    );
  }

  let currentAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <filter id="donutShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#0f172a" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Underlay background track */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} opacity="0.4" />

          {data.map((item, idx) => {
            const angleSize = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angleSize;
            currentAngle = endAngle;

            const pathD = angleSize >= 360
              ? `M ${center} ${center - radius} A ${radius} ${radius} 0 1 1 ${center - 0.01} ${center - radius} Z`
              : describeArc(center, center, radius, startAngle, endAngle);

            return (
              <path
                key={idx}
                d={pathD}
                fill="none"
                stroke={item.color || '#6366f1'}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                filter="url(#donutShadow)"
                className="transition-all duration-300 hover:stroke-[18px] cursor-pointer"
              />
            );
          })}

          {/* Centered sum text */}
          <circle cx={center} cy={center} r={radius - strokeWidth / 2} fill="#0f172a" opacity="0.8" />
          <text 
            x={center} 
            y={center - 3} 
            fill="#f8fafc" 
            textAnchor="middle" 
            fontWeight="900" 
            fontSize="15"
            fontFamily="monospace"
          >
            ${total.toLocaleString()}
          </text>
          <text 
            x={center} 
            y={center + 12} 
            fill="#64748b" 
            textAnchor="middle" 
            fontWeight="bold"
            fontSize="8" 
            style={{ textTransform: 'uppercase' }} 
            letterSpacing="1.2"
          >
            Givings
          </text>
        </svg>
      </div>

      {/* Legend list - Grid styling for premium feel */}
      <div className="flex-1 grid grid-cols-1 gap-2.5 max-w-xs">
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-bold text-[11px]">{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[10px]">
                <span className="text-slate-400 font-semibold">${item.value.toLocaleString()}</span>
                <span className="text-indigo-400 font-extrabold bg-indigo-950/60 border border-indigo-900/50 px-1.5 py-0.5 rounded text-[9px]">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
