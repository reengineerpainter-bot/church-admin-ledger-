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

// Bezier Curve generator for smooth path lines (Enterprise BI Standard)
const getBezierPath = (points) => {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    // Control points at 1/3 and 2/3 of X distance
    const cpX1 = p0.x + (p1.x - p0.x) / 3;
    const cpY1 = p0.y;
    const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
    const cpY2 = p1.y;
    d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
  }
  return d;
};

export function LineChart({ data = [], height = 180, strokeColor = '#6366f1', fillColor, formatValue = (v) => `$${v.toLocaleString()}` }) {
  if (!data || data.length === 0) return <div className="text-slate-500 text-[11px] text-center py-10 italic font-medium">No data available</div>;

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

  // Generate coordinates
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - ((d.value - minVal) / (range || 1)) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  const smoothPathD = getBezierPath(points);
  const areaD = points.length > 0 
    ? `${smoothPathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Y-axis gridlines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const y = paddingTop + chartHeight * ratio;
    const value = Math.round(maxVal - ratio * range);
    return { y, value };
  });

  const gradId = `areaGrad-${strokeColor.replace('#', '')}`;

  return (
    <div className="w-full flex items-center justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[170px] select-none overflow-visible">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
          <pattern id="dotGrid" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.75" fill="#475569" opacity="0.15" />
          </pattern>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor={strokeColor} floodOpacity="0.25" />
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
              stroke="#334155" 
              strokeWidth="0.8" 
              opacity="0.2"
            />
            <text 
              x={paddingLeft - 10} 
              y={line.y + 3} 
              fill="#475569" 
              fontSize="8.5" 
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="end"
            >
              {formatValue(line.value)}
            </text>
          </g>
        ))}

        {/* Gradient area under bezier curve */}
        {areaD && <path d={areaD} fill={`url(#${gradId})`} />}

        {/* Smooth line */}
        {smoothPathD && (
          <path 
            d={smoothPathD} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            filter="url(#shadow)"
          />
        )}

        {/* Interactive points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="6" 
              fill={strokeColor} 
              opacity="0"
              className="transition-all duration-200 group-hover:opacity-20"
            />
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="3.5" 
              fill="#0f172a" 
              stroke={strokeColor} 
              strokeWidth="1.8"
            />
            {/* Tooltip on hover */}
            <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
              <rect
                x={p.x - 30}
                y={p.y - 25}
                width="60"
                height="17"
                rx="5"
                fill="#0f172a"
                stroke="#334155"
                strokeWidth="0.8"
              />
              <text
                x={p.x}
                y={p.y - 14}
                fill="#f8fafc"
                fontSize="8.5"
                fontWeight="800"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {formatValue(p.value)}
              </text>
            </g>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, idx) => (
          <text 
            key={idx} 
            x={p.x} 
            y={height - 6} 
            fill="#475569" 
            fontSize="8.5" 
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

export function BarChart({ data = [], height = 180, barColor = '#10b981', formatValue = (v) => `$${v.toLocaleString()}` }) {
  if (!data || data.length === 0) return <div className="text-slate-500 text-[11px] text-center py-10 italic font-medium">No data available</div>;

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
  // Enforce slim modern bar width bounds to avoid fat chunk blocks
  const barWidth = Math.min((chartWidth / barCount) * 0.45, 18);
  const gap = (chartWidth - barWidth * barCount) / (barCount || 1);

  const barGradId = `barGrad-${barColor.replace('#', '')}`;

  return (
    <div className="w-full flex items-center justify-center">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-h-[170px] select-none overflow-visible">
        <defs>
          <linearGradient id={barGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} stopOpacity="1" />
            <stop offset="100%" stopColor={barColor} stopOpacity="0.5" />
          </linearGradient>
          <pattern id="dotGridBar" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.75" fill="#475569" opacity="0.15" />
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
              stroke="#334155" 
              strokeWidth="0.8"
              opacity="0.2"
            />
            <text 
              x={paddingLeft - 10} 
              y={line.y + 3} 
              fill="#475569" 
              fontSize="8.5" 
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="end"
            >
              {formatValue(line.value)}
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
              {/* Subtle bar background track */}
              <rect 
                x={x} 
                y={paddingTop} 
                width={barWidth} 
                height={chartHeight} 
                fill="#1e293b" 
                opacity="0.1"
                rx="3.5"
              />
              {/* Actual bar */}
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={Math.max(barH, 3)} 
                fill={`url(#${barGradId})`} 
                rx="3.5"
                className="transition-all duration-200 hover:brightness-110"
              />
              {/* Tooltip on hover */}
              <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
                <rect
                  x={x + barWidth / 2 - 30}
                  y={y - 25}
                  width="60"
                  height="17"
                  rx="5"
                  fill="#0f172a"
                  stroke="#334155"
                  strokeWidth="0.8"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 14}
                  fill="#f8fafc"
                  fontSize="8.5"
                  fontWeight="800"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {formatValue(d.value)}
                </text>
              </g>
              {/* X label */}
              <text 
                x={x + barWidth / 2} 
                y={height - 6} 
                fill="#475569" 
                fontSize="8.5" 
                fontWeight="bold"
                textAnchor="middle"
              >
                {d.label.length > 10 ? d.label.substring(0, 8) + '..' : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function DonutChart({ data = [], size = 130, strokeWidth = 12 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size - strokeWidth - 15) / 2;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg width={size} height={size}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
          <text x={center} y={center} fill="#475569" textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-bold font-mono">NO RECORDS</text>
        </svg>
      </div>
    );
  }

  let currentAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full py-2">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <filter id="donutShadow" x="-15%" y="-15%" width="130%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="4.5" floodColor="#0f172a" floodOpacity="0.45" />
            </filter>
          </defs>

          {/* Underlay background track */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} opacity="0.3" />

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
                className="transition-all duration-300 hover:stroke-[14px] cursor-pointer"
              />
            );
          })}

          {/* Centered sum text */}
          <circle cx={center} cy={center} r={radius - strokeWidth / 2} fill="#0f172a" opacity="0.8" />
          <text 
            x={center} 
            y={center - 2} 
            fill="#f8fafc" 
            textAnchor="middle" 
            fontWeight="900" 
            fontSize="12"
            fontFamily="monospace"
          >
            ${total.toLocaleString()}
          </text>
          <text 
            x={center} 
            y={center + 9} 
            fill="#475569" 
            textAnchor="middle" 
            fontWeight="bold"
            fontSize="7.5" 
            style={{ textTransform: 'uppercase' }} 
            letterSpacing="1"
          >
            Total
          </text>
        </svg>
      </div>

      {/* Legend list - Grid styling for premium feel */}
      <div className="flex-grow grid grid-cols-1 gap-1.5 max-w-[180px]">
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-950/40 border border-slate-850 hover:border-slate-800 transition-colors">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-bold text-[10px] truncate max-w-[80px]">{item.label}</span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[9px] shrink-0">
                <span className="text-slate-400 font-semibold">${item.value.toLocaleString()}</span>
                <span className="text-indigo-400 font-extrabold bg-indigo-950/60 border border-indigo-900/30 px-1 py-0.5 rounded text-[8px]">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
