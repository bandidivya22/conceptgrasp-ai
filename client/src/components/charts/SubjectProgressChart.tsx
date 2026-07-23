import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface DataPoint {
  subject: string;
  hours: number;
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function SubjectProgressChart({ data }: { data: DataPoint[] }) {
  const { theme } = useTheme();
  const grid = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
        <XAxis type="number" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="subject"
          stroke={tickColor}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
        />
        <Tooltip
          contentStyle={{
            background: theme === 'dark' ? '#1e293b' : '#fff',
            border: `1px solid ${grid}`,
            borderRadius: '12px',
            fontSize: '12px',
          }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
        />
        <Bar dataKey="hours" radius={[0, 8, 8, 0]} maxBarSize={28}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
