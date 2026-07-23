import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

interface DataPoint {
  attempt: string;
  score: number;
}

export default function QuizPerformanceChart({ data }: { data: DataPoint[] }) {
  const { theme } = useTheme();
  const grid = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="attempt" stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke={tickColor} fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
        <Tooltip
          contentStyle={{
            background: theme === 'dark' ? '#1e293b' : '#fff',
            border: `1px solid ${grid}`,
            borderRadius: '12px',
            fontSize: '12px',
          }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#06b6d4"
          strokeWidth={3}
          dot={{ fill: '#06b6d4', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
