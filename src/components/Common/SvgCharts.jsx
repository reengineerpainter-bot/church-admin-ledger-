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

export function LineChart({ data = [], height = 180, strokeColor = '#6366f1', fillColor = 'url(#gradient-indigo)' }) {
  if (!data || data.length === 0) return <div className="text-slate-400 text-sm text-center py-8">No data available</div>;

  const width = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
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

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        <defs>
          <linearGradient id="gradient-indigo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.4" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={line.y} 
              x2={width - paddingRight} 
              y2={line.y} 
              stroke="#334155" 
              strokeWidth="1" 
              strokeDasharray="4 4"
            />
            <text 
              x={paddingLeft - 10} 
              y={line.y + 4} 
              fill="#94a3b8" 
              fontSize="10" 
              textAnchor="end"
            >
              ${line.value}
            </text>
          </g>
        ))}

        {/* Area fill */}
        {areaD && <path d={areaD} fill={fillColor} />}

        {/* Spark line */}
        {pathD && (
          <path 
            d={pathD} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4" 
              fill={strokeColor} 
              stroke="#0f172a" 
              strokeWidth="2"
              className="transition-all duration-200 hover:r-6"
            />
            <text
              x={p.x}
              y={p.y - 10}
              fill="#f8fafc"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-slate-900 px-1 rounded pointer-events-none"
            >
              ${p.value}
            </text>
          </g>
        ))}

        {/* X-axis labels */}
        {points.map((p, idx) => (
          <text 
            key={idx} 
            x={p.x} 
            y={height - 8} 
            fill="#94a3b8" 
            fontSize="10" 
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
  if (!data || data.length === 0) return <div className="text-slate-400 text-sm text-center py-8">No data available</div>;

  const width = 500;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
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
  const barWidth = (chartWidth / barCount) * 0.6;
  const gap = (chartWidth / barCount) * 0.4;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
        {/* Gridlines */}
        {gridLines.map((line, idx) => (
          <g key={idx}>
            <line 
              x1={paddingLeft} 
              y1={line.y} 
              x2={width - paddingRight} 
              y2={line.y} 
              stroke="#334155" 
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <text 
              x={paddingLeft - 10} 
              y={line.y + 4} 
              fill="#94a3b8" 
              fontSize="10" 
              textAnchor="end"
            >
              {line.value}
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
              {/* Actual bar */}
              <rect 
                x={x} 
                y={y} 
                width={barWidth} 
                height={Math.max(barH, 2)} 
                fill={barColor} 
                rx="4"
                className="transition-all duration-200 hover:opacity-80"
              />
              {/* Value label on hover */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                fill="#f8fafc"
                fontSize="10"
                fontWeight="bold"
                textAnchor="middle"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              >
                {d.value}
              </text>
              {/* X label */}
              <text 
                x={x + barWidth / 2} 
                y={height - 8} 
                fill="#94a3b8" 
                fontSize="9" 
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

export function DonutChart({ data = [], size = 200, strokeWidth = 20 }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = (size - strokeWidth - 20) / 2;

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <svg width={size} height={size}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#334155" strokeWidth={strokeWidth} />
          <text x={center} y={center} fill="#64748b" textAnchor="middle" dominantBaseline="middle" className="text-xs">No Data</text>
        </svg>
      </div>
    );
  }

  let currentAngle = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {data.map((item, idx) => {
            const angleSize = (item.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angleSize;
            currentAngle = endAngle;

            // Draw full circle as 2 arcs if it's 100% to avoid SVG path glitches
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
                className="transition-all duration-300 hover:opacity-90 cursor-pointer"
              />
            );
          })}

          {/* Centered sum text */}
          <text 
            x={center} 
            y={center - 4} 
            fill="#f8fafc" 
            textAnchor="middle" 
            fontWeight="bold" 
            fontSize="18"
          >
            ${total.toLocaleString()}
          </text>
          <text 
            x={center} 
            y={center + 14} 
            fill="#94a3b8" 
            textAnchor="middle" 
            fontSize="10" 
            style={{ textTransform: 'uppercase' }} 
            letterSpacing="1"
          >
            Total
          </text>
        </svg>
      </div>

      {/* Legend list */}
      <div className="flex flex-col gap-2">
        {data.map((item, idx) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-300 font-medium">{item.label}:</span>
              <span className="text-slate-400">${item.value.toLocaleString()}</span>
              <span className="text-indigo-400 font-semibold">({pct}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
