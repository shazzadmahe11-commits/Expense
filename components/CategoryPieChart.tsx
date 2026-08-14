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
}

function truncate(name: string, max: number) {
  return name.length > max ? name.slice(0, max - 1) + '…' : name;
}

const RADIAN = Math.PI / 180;

// Label sits just outside the ring with a short leader line back to the slice,
// instead of being crammed inside the (thin) donut band.
const renderOuterLabel = (props: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
  name?: string;
}) => {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0, name = '' } = props;
  if (percent < 0.05) return null;

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
        fontSize={10.5}
        fontWeight={600}
        fill="var(--text-secondary)"
      >
        {truncate(name, 14)}
      </text>
    </g>
  );
};

export default function CategoryPieChart({ data, total }: Props) {
  const chartData = data.map((item) => ({
    name: item.category.name,
    value: item.total,
    color: item.category.color,
    icon: item.category.icon,
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={78}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderOuterLabel}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend — exact amounts/percentages that don't fit on the chart itself */}
      <div className="chart-legend">
        {data.map((item) => (
          <div key={item.category.id} className="legend-item">
            <div className="legend-left">
              <div className="color-dot" style={{ background: item.category.color }} />
              <span>{item.category.icon} {item.category.name}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="legend-value">{formatCAD(item.total)}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {total > 0 ? `${((item.total / total) * 100).toFixed(1)}%` : '0%'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
