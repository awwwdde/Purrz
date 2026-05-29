import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Icon } from "@/shared/ui";
import { mockApi } from "@/shared/api/mock-api";
import type { Company, Lead } from "@/shared/types";
import { useAuth } from "@/app/store/auth";

// Pseudo-deterministic series based on seed so demo looks stable
function genSeries(seed: number, days: number, base: number, variance: number): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < days; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    out.push(Math.max(0, Math.round(base + (r - 0.5) * variance + Math.sin(i / 3) * (variance / 3))));
  }
  return out;
}

interface AreaChartProps {
  data: number[];
  color: string;
  height?: number;
}
function AreaChart({ data, color, height = 160 }: AreaChartProps) {
  const max = Math.max(...data, 1);
  const w = 100;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${100 - (v / max) * 100}`)
    .join(" ");
  const area = `0,100 ${points} ${w},100`;
  return (
    <svg viewBox={`0 0 ${w} 100`} preserveAspectRatio="none" style={{ height, width: "100%" }}>
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

function BarChart({ data, color, height = 160 }: AreaChartProps) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ duration: 0.5, delay: i * 0.02 }}
          className="flex-1 rounded-t-md border-t border-x border-ink-950"
          style={{ background: color }}
        />
      ))}
    </div>
  );
}

export function CrmAnalyticsPage() {
  const user = useAuth((s) => s.user);
  const [company, setCompany] = useState<Company | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    if (!user?.companyId) return;
    mockApi.getCompany(user.companyId).then((c) => setCompany(c ?? null));
    mockApi.listLeads({ companyId: user.companyId }).then(setLeads);
  }, [user?.companyId]);

  const seed = useMemo(
    () => (company ? company.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0) : 1),
    [company],
  );

  const views = useMemo(() => genSeries(seed, 14, 250, 200), [seed]);
  const clicks = useMemo(() => genSeries(seed + 7, 14, 60, 50), [seed]);
  const leadsSeries = useMemo(() => genSeries(seed + 13, 14, 8, 8), [seed]);

  const totalViews = views.reduce((a, b) => a + b, 0);
  const totalClicks = clicks.reduce((a, b) => a + b, 0);
  const totalLeads = leadsSeries.reduce((a, b) => a + b, 0);
  const ctr = totalViews ? ((totalClicks / totalViews) * 100).toFixed(1) : "0";
  const conv = totalClicks ? ((totalLeads / totalClicks) * 100).toFixed(1) : "0";

  const byService = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => {
      map[l.serviceName] = (map[l.serviceName] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [leads]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="heading-3 mb-1">Аналитика</h1>
        <p className="text-ink-600">Динамика за последние 14 дней</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Просмотры", value: totalViews.toLocaleString("ru-RU"), delta: "+24%", icon: "eye" as const },
          { label: "Клики", value: totalClicks.toLocaleString("ru-RU"), delta: "+12%", icon: "arrow-up-right" as const },
          { label: "CTR", value: `${ctr}%`, delta: "+1.2pp", icon: "trending-up" as const },
          { label: "Конверсия в лид", value: `${conv}%`, delta: "+0.8pp", icon: "bolt" as const },
        ].map((k) => (
          <div key={k.label} className="bg-white border border-ink-200 rounded-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-ink-950 text-accent grid place-items-center">
                <Icon name={k.icon} size={16} />
              </div>
              <span className="text-xs font-display font-semibold text-signal-green">
                {k.delta}
              </span>
            </div>
            <div className="font-display text-3xl font-bold tracking-tight">{k.value}</div>
            <div className="text-xs text-ink-500 uppercase tracking-wider font-display mt-1">
              {k.label}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-ink-200 rounded-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold">Просмотры карточки</h3>
            <Badge tone="default">14 дней</Badge>
          </div>
          <AreaChart data={views} color="#4D7BFF" />
        </div>
        <div className="bg-white border border-ink-200 rounded-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-lg font-semibold">Заявки в день</h3>
            <Badge tone="accent">+{leadsSeries[leadsSeries.length - 1]} сегодня</Badge>
          </div>
          <BarChart data={leadsSeries} color="#D6FF3D" />
        </div>
      </div>

      <div className="bg-white border border-ink-200 rounded-card p-6">
        <h3 className="font-display text-lg font-semibold mb-5">Топ услуг по заявкам</h3>
        {byService.length === 0 ? (
          <div className="text-ink-500 text-sm">Пока нет данных по заявкам.</div>
        ) : (
          <div className="space-y-3">
            {byService.map(([name, count], i) => {
              const max = byService[0][1];
              const pct = Math.round((count / max) * 100);
              return (
                <div key={name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-display font-semibold">{i + 1}. {name}</span>
                    <span className="text-ink-500">{count}</span>
                  </div>
                  <div className="h-3 bg-ink-100 rounded-full overflow-hidden border border-ink-200">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      className="h-full bg-accent"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
