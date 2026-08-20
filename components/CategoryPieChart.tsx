'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatCAD } from '@/lib/utils';

interface CategoryItem {
  category: { id: string; name: string; icon: string; color: string };
  total: number;
}

interface Props {
  data: CategoryItem[];
  total: number;
  budgets?: Record<string, number>;
}

function truncate(name: string, max: number) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

const RADIAN = Math.PI / 180;

// Label sits just outside the ring with a short leader line back to the slice.
const renderOuterLabel = (props: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
  name?: string;
}) => {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0, name = '' } = props;

  const lineStart = outerRadius + 6;
  const lineEnd = outerRadius + 14;
  const labelPos = outerRadius + 18;

  const x1 = cx + lineStart * Math.cos(-midAngle * RADIAN);
  const y1 = cy + lineStart * Math.sin(-midAngle * RADIAN);
  const x2 = cx + lineEnd * Math.cos(-midAngle * RADIAN);
  const y2 = cy + lineEnd * Math.sin(-midAngle * RADIAN);
  const xText = cx + labelPos * Math.cos(-midAngle * RADIAN);
  const yText = cy + labelPos * Math.sin(-midAngle * RADIAN);
  const isRight = xText > cx;

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-muted)" strokeWidth={1} />
      <text
        x={xText + (isRight ? 3 : -3)}
        y={yText}
        textAnchor={isRight ? 'start' : 'end'}
        dominantBaseline="central"
      >
        <tspan fontSize={10.5} fontWeight={600} fill="var(--text-secondary)">
          {truncate(name, 13)}
        </tspan>
        <tspan fontSize={9.5} fontWeight={500} fill="var(--text-muted)" dx={4}>
          {(percent * 100).toFixed(0)}%
        </tspan>
      </text>
    </g>
  );
};

export default function CategoryPieChart({ data, total, budgets = {} }: Props) {
  const chartData = data.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color,
    icon: item.category.icon,
  }));

  return (
    <div style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart margin={{ top: 24, right: 46, bottom: 24, left: 46 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={74}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={renderOuterLabel}
              isAnimationActive={false}
              style={{ outline: 'none' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" style={{ outline: 'none' }} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center total — sits in the donut hole */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none', width: 100,
        }}>
          <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>
            Total
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.3, marginTop: 2 }}>
            {formatCAD(total)}
          </div>
        </div>
      </div>

      {/* Legend — top row (dollar + %) always matches the pie slice above (share of
          total spend). The bar below represents budget usage when a category has a
          budget set, and falls back to share-of-total when it doesn't. */}
      <div className="chart-legend">
        {data.map((item) => {
          const pct = total > 0 ? (item.total / total) * 100 : 0;
          const budget = budgets[item.category.id];
          const hasBudget = !!budget && budget > 0;
          const budgetPct = hasBudget ? Math.round((item.total / budget) * 100) : 0;
          const over = hasBudget && item.total > budget;
          const barPct = hasBudget ? budgetPct : pct;
          return (
            <div key={item.category.id} className="legend-item">
              <div className="legend-item-top">
                <div className="legend-left">
                  <div className="color-dot" style={{ background: item.category.color }} />
                  <span>{item.category.icon} {item.category.name}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="legend-value">{formatCAD(item.total)}</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(barPct, 100)}%`, background: over ? 'var(--red)' : item.category.color }}
                />
              </div>
              {hasBudget && (
                <div className={`category-budget-label${over ? ' over' : ''}`} style={{ marginTop: 4 }}>
                  {over ? '⚠ ' : ''}{formatCAD(item.total)} of {formatCAD(budget)} budget used ({budgetPct}%)
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
