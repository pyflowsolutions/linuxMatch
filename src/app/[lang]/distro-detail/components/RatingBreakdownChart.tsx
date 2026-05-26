'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from 'recharts';

interface RatingData {
  stars: number;
  count: number;
  pct: number;
}

interface Props {
  data: RatingData[];
}

export default function RatingBreakdownChart({ data }: Props) {
  const chartData = [...data].reverse();

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
        barSize={10}
      >
        <XAxis type="number" hide domain={[0, 100]} />
        <YAxis
          type="category"
          dataKey="stars"
          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
          width={16}
          tickFormatter={(v) => `${v}★`}
        />
        <Tooltip
          content={({ payload, label }) => {
            if (!payload?.length) return null;
            const d = payload[0].payload as RatingData;
            return (
              <div className="bg-card border border-border rounded-lg px-3 py-2 card-shadow-md">
                <p className="text-xs font-semibold text-foreground">{label} stars</p>
                <p className="text-sm font-bold text-foreground tabular-nums">
                  {d.count.toLocaleString()} reviews ({d.pct}%)
                </p>
              </div>
            );
          }}
        />
        <Bar dataKey="pct" radius={[0, 4, 4, 0]}>
          {chartData.map((entry) => (
            <Cell
              key={`cell-${entry.stars}`}
              fill={
                entry.stars >= 4
                  ? 'var(--success)'
                  : entry.stars === 3
                  ? 'var(--warning)'
                  : 'var(--danger)'
              }
              opacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}