'use client';

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Distro } from '../../components/distroData';

interface Props {
  distro: Distro;
}

export default function DistroRadarChart({ distro }: Props) {
  const data = [
    { attribute: 'Ease of Use', value: distro.easeOfUse },
    { attribute: 'HW Efficiency', value: distro.hardwareEfficiency },
    { attribute: 'Stability', value: distro.stabilityScore },
    { attribute: 'Community', value: distro.communitySize },
    { attribute: 'Docs', value: distro.documentationScore },
    { attribute: 'Compatibility', value: distro.compatibilityScore },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis
          dataKey="attribute"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontFamily: 'var(--font-sans)' }}
        />
        <Radar
          name={distro.name}
          dataKey="value"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Tooltip
          content={({ payload, label }) => {
            if (!payload?.length) return null;
            return (
              <div className="bg-card border border-border rounded-lg px-3 py-2 card-shadow-md">
                <p className="text-xs font-semibold text-foreground">{label}</p>
                <p className="text-sm font-bold text-primary tabular-nums">
                  {payload[0].value}/100
                </p>
              </div>
            );
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}