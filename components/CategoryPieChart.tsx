'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCAD } from '@/lib/utils';

interface CategoryItem {
  category: { id: string; name: string; icon: string; color: string };
  total: number;
}

interface Props {
  data: CategoryItem[];
  total: number;
}

const renderCustomLabel = (props: {
  cx?: number; cy?: number; midAngle?: number;
  innerRadius?: number; outerRadius?: number; percent?: number;
}) => {
  const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
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
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={renderCustomLabel}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [formatCAD(Number(value)), 'Spent']}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-primary)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
            }}
            itemStyle={{ color: 'var(--text-primary)' }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
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
