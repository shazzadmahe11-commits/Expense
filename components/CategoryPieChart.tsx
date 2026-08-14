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

const renderSliceLabel = (props: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
  name?: string; icon?: string;
}) => {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0, name = '', icon = '' } = props;
  if (percent < 0.06) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Enough room on the ring for icon + name on two lines; otherwise just the icon.
  const showName = percent >= 0.12;

  return (
    <text x={x} y={y} textAnchor="middle" dominantBaseline="central">
      <tspan x={x} dy={showName ? -6 : 0} fontSize={13}>{icon}</tspan>
      {showName && (
        <tspan x={x} dy={15} fontSize={9} fontWeight={700} fill="white">
          {truncate(name, 10)}
        </tspan>
      )}
    </text>
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
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderSliceLabel}
            isAnimationActive={false}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend — amounts/percentages that don't fit on the chart itself */}
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
