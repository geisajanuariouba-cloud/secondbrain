"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STUDY_TREND } from "@/lib/data";

export function StudyAreaChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={STUDY_TREND} margin={{ top: 10, right: 6, left: -22, bottom: 0 }}>
        <defs>
          <linearGradient id="gHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.45} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gQ" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
        <Tooltip
          cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }}
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "var(--shadow-md)",
            fontSize: 12,
            color: "var(--text)",
          }}
          labelStyle={{ color: "var(--text)", fontWeight: 700 }}
          formatter={(v, n) => [n === "hours" ? `${v}h` : `${v} questões`, n === "hours" ? "Horas" : "Questões"]}
        />
        <Area type="monotone" dataKey="hours" stroke="var(--primary)" strokeWidth={2.5} fill="url(#gHours)" />
        <Area type="monotone" dataKey="questions" stroke="var(--accent)" strokeWidth={2} fill="url(#gQ)" yAxisId={0} hide />
      </AreaChart>
    </ResponsiveContainer>
  );
}
