import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface DataPoint {
  day: string;
  hours: number;
}

export default function StudyHoursChart({ data }: { data: DataPoint[] }) {
  const { theme } = useTheme();
  const grid = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="day" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: theme === 'dark' ? '#1e293b' : '#fff',
            border: `1px solid ${grid}`,
            borderRadius: '12px',
            fontSize: '12px',
          }}
          cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
        />
        <Bar dataKey="hours" fill="#3b82f6" radius={[8, 8, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
