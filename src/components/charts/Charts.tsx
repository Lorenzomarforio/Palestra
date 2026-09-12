import { ReactNode } from 'react';
import './Charts.css';

interface ChartProps {
  width?: number;
  height?: number;
  className?: string;
}

interface LineChartProps extends ChartProps {
  data: { x: string | number; y: number }[];
  color?: string;
  strokeWidth?: number;
  showPoints?: boolean;
  showArea?: boolean;
  yMin?: number;
  yMax?: number;
  children?: ReactNode;
}

export function LineChart({
  data,
  width = 400,
  height = 200,
  color = 'var(--color-brand-500)',
  strokeWidth = 3,
  showPoints = true,
  showArea = false,
  yMin,
  yMax,
  className = '',
  children,
}: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className={`chart chart--empty ${className}`} style={{ width, height }} role="img" aria-label="No data available">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <rect width={width} height={height} fill="var(--color-bg-tertiary)" rx="var(--radius-lg)" />
        </svg>
        <div className="chart__empty-state">No data available</div>
      </div>
    );
  }

  const values = data.map((d) => d.y);
  const minVal = yMin ?? Math.min(...values, 0);
  const maxVal = yMax ?? Math.max(...values, 1);
  const range = maxVal - minVal || 1;

  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const xStep = innerWidth / Math.max(data.length - 1, 1);

  const getX = (index: number) => padding.left + index * xStep;
  const getY = (value: number) => padding.top + innerHeight - ((value - minVal) / range) * innerHeight;

  const pathPoints = data.map((_, i) => `${getX(i)},${getY(data[i].y)}`).join(' ');

  const areaPath = showArea
    ? `M ${padding.left} ${height - padding.bottom} L ${pathPoints} L ${getX(data.length - 1)} ${height - padding.bottom} Z`
    : '';

  const xLabels = data.map((d, i) => (
    <text
      key={i}
      x={getX(i)}
      y={height - padding.bottom + 18}
      textAnchor="middle"
      fontSize="11"
      fill="var(--color-text-tertiary)"
      fontFamily="var(--font-sans)"
    >
      {typeof d.x === 'string' ? d.x : d.x.toString()}
    </text>
  ));

  const yTicks = 5;
  const yLabels = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = maxVal - (range / yTicks) * i;
    const y = padding.top + (innerHeight / yTicks) * i;
    return (
      <g key={i}>
        <line
          x1={padding.left - 5}
          y1={y}
          x2={padding.left}
          y2={y}
          stroke="var(--color-border-primary)"
          strokeWidth="1"
        />
        <text
          x={padding.left - 8}
          y={y + 4}
          textAnchor="end"
          fontSize="11"
          fill="var(--color-text-tertiary)"
          fontFamily="var(--font-sans)"
        >
          {value % 1 === 0 ? value.toString() : value.toFixed(1)}
        </text>
      </g>
    );
  });

  const horizontalGrid = Array.from({ length: yTicks + 1 }, (_, i) => {
    const y = padding.top + (innerHeight / yTicks) * i;
    return (
      <line
        key={i}
        x1={padding.left}
        y1={y}
        x2={width - padding.right}
        y2={y}
        stroke="var(--color-border-primary)"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.5"
      />
    );
  });

  return (
    <div className={`chart ${className}`} style={{ width, height }} role="img" aria-label="Line chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width={width} height={height} fill="transparent" rx="var(--radius-lg)" />

        {/* Grid */}
        <g>{horizontalGrid}</g>

        {/* Area */}
        {showArea && (
          <path
            d={areaPath}
            fill="url(#area-gradient)"
            stroke="none"
          />
        )}

        {/* Line */}
        <path
          d={`M ${pathPoints}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart__line"
        />

        {/* Points */}
        {showPoints && (
          <g>
            {data.map((d, i) => (
              <circle
                key={i}
                cx={getX(i)}
                cy={getY(d.y)}
                r={4}
                fill="var(--color-bg-primary)"
                stroke={color}
                strokeWidth={strokeWidth}
                className="chart__point"
              />
            ))}
          </g>
        )}

        {/* Y Axis Labels */}
        <g>{yLabels}</g>

        {/* X Axis Labels */}
        <g>{xLabels}</g>

        {/* Y Axis Line */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="var(--color-border-primary)"
          strokeWidth="1"
        />

        {/* X Axis Line */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--color-border-primary)"
          strokeWidth="1"
        />
      </svg>
      {children}
    </div>
  );
}

interface BarChartProps extends ChartProps {
  data: { label: string; value: number; color?: string }[];
  showValues?: boolean;
  horizontal?: boolean;
}

export function BarChart({
  data,
  width = 400,
  height = 200,
  showValues = true,
  horizontal = false,
  className = '',
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className={`chart chart--empty ${className}`} style={{ width, height }} role="img" aria-label="No data available">
        <div className="chart__empty-state">No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  if (horizontal) {
    const barHeight = (innerHeight - (data.length + 1) * 8) / data.length;

    return (
      <div className={`chart chart--horizontal ${className}`} style={{ width, height }} role="img" aria-label="Horizontal bar chart">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <rect width={width} height={height} fill="transparent" rx="var(--radius-lg)" />

          {data.map((d, i) => {
            const y = padding.top + i * (barHeight + 8);
            const barWidth = (d.value / maxValue) * innerWidth;

            return (
              <g key={i}>
                {/* Bar */}
                <rect
                  x={padding.left}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={4}
                  fill={d.color || 'var(--color-brand-500)'}
                  className="chart__bar"
                />

                {/* Label */}
                <text
                  x={padding.left - 10}
                  y={y + barHeight / 2 + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="var(--color-text-secondary)"
                  fontFamily="var(--font-sans)"
                >
                  {d.label}
                </text>

                {/* Value */}
                {showValues && (
                  <text
                    x={padding.left + barWidth + 8}
                    y={y + barHeight / 2 + 4}
                    fontSize="12"
                    fill="var(--color-text-primary)"
                    fontFamily="var(--font-sans)"
                    fontWeight="600"
                  >
                    {d.value}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  const barWidth = Math.min(40, innerWidth / data.length / 1.5);
  const gap = (innerWidth - data.length * barWidth) / (data.length + 1);

  return (
    <div className={`chart ${className}`} style={{ width, height }} role="img" aria-label="Bar chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect width={width} height={height} fill="transparent" rx="var(--radius-lg)" />

        {/* Horizontal grid */}
        {Array.from({ length: 5 }, (_, i) => {
          const y = padding.top + (innerHeight / 4) * i;
          return (
            <line
              key={i}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke="var(--color-border-primary)"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.5"
            />
          );
        })}

        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * innerHeight;
          const x = padding.left + gap + i * (barWidth + gap);
          const y = height - padding.bottom - barHeight;

          return (
            <g key={i}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={d.color || 'var(--color-brand-500)'}
                className="chart__bar"
              />

              {/* Value on top */}
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-text-primary)"
                  fontFamily="var(--font-sans)"
                  fontWeight="600"
                >
                  {d.value}
                </text>
              )}

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                fontSize="11"
                fill="var(--color-text-tertiary)"
                fontFamily="var(--font-sans)"
              >
                {d.label}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="var(--color-border-primary)"
          strokeWidth="1"
        />
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="var(--color-border-primary)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

interface DonutChartProps extends ChartProps {
  data: { label: string; value: number; color: string }[];
  centerLabel?: string;
  centerValue?: string;
  strokeWidth?: number;
}

export function DonutChart({
  data,
  width = 200,
  height = 200,
  centerLabel,
  centerValue,
  strokeWidth = 20,
  className = '',
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <div className={`chart chart--empty ${className}`} style={{ width, height }} role="img" aria-label="No data available">
        <div className="chart__empty-state">No data</div>
      </div>
    );
  }

  const radius = Math.min(width, height) / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  const segments = data.map((d) => {
    const percentage = d.value / total;
    const segmentLength = circumference * percentage;
    const dashOffset = -currentOffset;
    currentOffset += segmentLength;

    const startAngle = (currentOffset - segmentLength) / radius - Math.PI / 2;
    const endAngle = currentOffset / radius - Math.PI / 2;

    const largeArc = percentage > 0.5 ? 1 : 0;

    const startX = width / 2 + radius * Math.cos(startAngle);
    const startY = height / 2 + radius * Math.sin(startAngle);
    const endX = width / 2 + radius * Math.cos(endAngle);
    const endY = height / 2 + radius * Math.sin(endAngle);

    return (
      <path
        key={d.label}
        d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`}
        stroke={d.color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        className="chart__donut-segment"
      />
    );
  });

  return (
    <div className={`chart chart--donut ${className}`} style={{ width, height }} role="img" aria-label="Donut chart">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="var(--color-border-primary)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Segments */}
        <g>{segments}</g>

        {/* Center text */}
        {(centerLabel || centerValue) && (
          <g className="chart__donut-center">
            {centerValue && (
              <text
                x={width / 2}
                y={height / 2 - (centerLabel ? 8 : 0)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="28"
                fontWeight="700"
                fill="var(--color-text-primary)"
                fontFamily="var(--font-sans)"
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                x={width / 2}
                y={height / 2 + (centerValue ? 16 : 4)}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="12"
                fill="var(--color-text-tertiary)"
                fontFamily="var(--font-sans)"
              >
                {centerLabel}
              </text>
            )}
          </g>
        )}

        {/* Legend */}
        <g className="chart__donut-legend">
          {data.map((d, i) => (
            <g
              key={d.label}
              transform={`translate(${width / 2}, ${height + 30 + i * 20})`}
            >
              <circle cx={-60} cy={0} r={6} fill={d.color} />
              <text
                x={-48}
                y={4}
                fontSize="11"
                fill="var(--color-text-secondary)"
                fontFamily="var(--font-sans)"
              >
                {d.label}: {d.value}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  color?: 'brand' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
}

export function StatCard({
  label,
  value,
  change,
  changeLabel,
  icon,
  color = 'brand',
  className = '',
}: StatCardProps) {
  const colorClass = `stat-card--${color}`;

  return (
    <div className={`stat-card ${colorClass} ${className}`}>
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {icon && <span className="stat-card__icon">{icon}</span>}
      </div>
      <div className="stat-card__value">{value}</div>
      {change !== undefined && (
        <div className={`stat-card__change ${change >= 0 ? 'stat-card__change--positive' : 'stat-card__change--negative'}`}>
          <span aria-hidden="true">{change >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(change)}%</span>
          {changeLabel && <span>{changeLabel}</span>}
        </div>
      )}
    </div>
  );
}