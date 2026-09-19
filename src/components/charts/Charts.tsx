'use client';

import { ReactNode, useState } from 'react';
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
  formatValue?: (val: number) => string;
}

export function DonutChart({
  data,
  width,
  height = 240,
  centerLabel,
  centerValue,
  strokeWidth = 24,
  formatValue,
  className = '',
}: DonutChartProps) {
  const [selectedItem, setSelectedItem] = useState<{
    label: string;
    value: number;
    color: string;
    percentage: number;
    tooltipX: number;
    tooltipY: number;
  } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<typeof selectedItem>(null);

  const activeItem = selectedItem || hoveredItem;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const size = height || width || 240;
  const cx = size / 2;
  const cy = size / 2;
  const radius = Math.max(30, size / 2 - strokeWidth - 18);
  const circumference = 2 * Math.PI * radius;

  if (total === 0) {
    return (
      <div
        className={`chart chart--empty ${className}`}
        style={{ width: '100%', height: size }}
        role="img"
        aria-label="Nessun dato disponibile"
      >
        <div className="chart__empty-state">Nessun dato</div>
      </div>
    );
  }

  const format = (val: number) => (formatValue ? formatValue(val) : `${val.toLocaleString()} kg`);

  let currentOffset = 0;
  const segmentInfos = data.map((d) => {
    const percentage = total > 0 ? d.value / total : 0;
    const segmentLength = circumference * percentage;
    const dashOffset = currentOffset;
    const midOffset = currentOffset + segmentLength / 2;
    currentOffset += segmentLength;

    const midAngle = (midOffset / circumference) * 2 * Math.PI - Math.PI / 2;
    const tooltipDistance = radius + strokeWidth / 2 + 14;
    const tooltipX = cx + tooltipDistance * Math.cos(midAngle);
    const tooltipY = cy + tooltipDistance * Math.sin(midAngle);

    return {
      ...d,
      percentage,
      segmentLength,
      dashOffset,
      midAngle,
      tooltipX,
      tooltipY,
    };
  });

  const handleToggle = (item: (typeof segmentInfos)[number]) => {
    if (selectedItem?.label === item.label) {
      setSelectedItem(null);
    } else {
      setSelectedItem(item);
    }
  };

  const clampedX = activeItem ? Math.max(45, Math.min(size - 45, activeItem.tooltipX)) : cx;
  const clampedY = activeItem ? Math.max(22, Math.min(size - 22, activeItem.tooltipY)) : cy;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div
        className={`chart chart--donut ${className}`}
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        role="img"
        aria-label="Grafico a torta distribuzione gruppi muscolari"
      >
        {/* Floating tooltip indicating muscle group */}
        {activeItem && (
          <div
            className="chart__donut-tooltip"
            style={{
              position: 'absolute',
              top: `${clampedY}px`,
              left: `${clampedX}px`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: `1.5px solid ${activeItem.color}`,
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.45)',
              borderRadius: '9999px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              pointerEvents: 'none',
              zIndex: 10,
              whiteSpace: 'nowrap',
              animation: 'chartTooltipFadeIn 0.15s ease-out',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: activeItem.color,
                display: 'inline-block',
                flexShrink: 0,
              }}
            />
            <span>{activeItem.label}</span>
            <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 400, fontSize: '11px' }}>
              {Math.round(activeItem.percentage * 100)}%
            </span>
          </div>
        )}

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ overflow: 'visible', maxWidth: '100%', height: 'auto' }}
        >
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="var(--color-border-primary)"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.35}
          />

          {/* Segments */}
          <g>
            {segmentInfos.map((d) => {
              const isSelected = selectedItem?.label === d.label;
              const isHovered = hoveredItem?.label === d.label;
              const isActive = isSelected || isHovered;
              const isAnyActive = activeItem !== null;

              return (
                <g key={d.label}>
                  {/* Visible arc */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke={d.color}
                    strokeWidth={isActive ? strokeWidth + 5 : strokeWidth}
                    fill="none"
                    strokeDasharray={
                      data.length > 1
                        ? `${Math.max(1, d.segmentLength - 3)} ${circumference - Math.max(1, d.segmentLength - 3)}`
                        : `${d.segmentLength} 0`
                    }
                    strokeDashoffset={-d.dashOffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    className="chart__donut-segment"
                    style={{
                      cursor: 'pointer',
                      transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                      opacity: isAnyActive && !isActive ? 0.35 : 1,
                    }}
                  />
                  {/* Wider transparent hit target for easy clicking and tapping */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    stroke="transparent"
                    strokeWidth={strokeWidth + 20}
                    fill="none"
                    strokeDasharray={
                      data.length > 1
                        ? `${Math.max(1, d.segmentLength - 3)} ${circumference - Math.max(1, d.segmentLength - 3)}`
                        : `${d.segmentLength} 0`
                    }
                    strokeDashoffset={-d.dashOffset}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(d);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleToggle(d);
                    }}
                    onMouseEnter={() => setHoveredItem(d)}
                    onMouseLeave={() => setHoveredItem(null)}
                  />
                </g>
              );
            })}
          </g>

          {/* Center text */}
          <g
            className="chart__donut-center"
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedItem(null)}
          >
            {activeItem ? (
              <>
                <text
                  x={cx}
                  y={cy - 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="18"
                  fontWeight="700"
                  fill={activeItem.color}
                  fontFamily="var(--font-sans)"
                >
                  {activeItem.label}
                </text>
                <text
                  x={cx}
                  y={cy + 10}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fontWeight="600"
                  fill="var(--color-text-primary)"
                  fontFamily="var(--font-sans)"
                >
                  {format(activeItem.value)}
                </text>
                <text
                  x={cx}
                  y={cy + 28}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11"
                  fill="var(--color-text-tertiary)"
                  fontFamily="var(--font-sans)"
                >
                  {Math.round(activeItem.percentage * 100)}% del totale
                </text>
              </>
            ) : (
              <>
                {centerValue && (
                  <text
                    x={cx}
                    y={cy - (centerLabel ? 8 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="24"
                    fontWeight="700"
                    fill="var(--color-text-primary)"
                    fontFamily="var(--font-sans)"
                  >
                    {centerValue}
                  </text>
                )}
                {centerLabel && (
                  <text
                    x={cx}
                    y={cy + (centerValue ? 18 : 4)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="12"
                    fill="var(--color-text-tertiary)"
                    fontFamily="var(--font-sans)"
                  >
                    {centerLabel}
                  </text>
                )}
              </>
            )}
          </g>
        </svg>
      </div>

      {/* Interactive Legend Pills */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          marginTop: 'var(--space-4)',
          width: '100%',
        }}
      >
        {segmentInfos.map((d) => {
          const isSelected = activeItem?.label === d.label;
          return (
            <button
              key={d.label}
              type="button"
              onClick={() => handleToggle(d)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '9999px',
                border: isSelected ? `1.5px solid ${d.color}` : '1px solid var(--color-border-primary)',
                backgroundColor: isSelected ? 'var(--color-bg-primary)' : 'var(--color-bg-elevated)',
                color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: '12px',
                fontWeight: isSelected ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: isSelected ? `0 0 10px ${d.color}40` : 'none',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: d.color,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span>{d.label}</span>
              <span style={{ color: 'var(--color-text-tertiary)', fontSize: '11px' }}>
                {Math.round(d.percentage * 100)}%
              </span>
            </button>
          );
        })}
      </div>
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