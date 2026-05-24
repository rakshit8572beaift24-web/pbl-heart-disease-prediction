import { useMemo } from 'react';

export const useChartTheme = (darkMode) =>
  useMemo(
    () => ({
      text: darkMode ? '#e2e8f0' : '#334155',
      muted: darkMode ? '#94a3b8' : '#64748b',
      grid: darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.35)',
      tooltipBg: darkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
      tooltipBorder: darkMode ? '#334155' : '#e2e8f0',
    }),
    [darkMode]
  );

export const baseAnimation = {
  duration: 1400,
  easing: 'easeOutQuart',
};

export const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart, _args, opts) {
    const meta = chart.getDatasetMeta(0);
    if (!meta?.data?.[0]) return;
    const { x, y } = meta.data[0];
    const { ctx } = chart;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (opts.value != null) {
      ctx.font = `bold ${opts.valueSize || 26}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = opts.color || '#0f172a';
      ctx.fillText(String(opts.value), x, y - (opts.sub ? 8 : 0));
    }
    if (opts.sub) {
      ctx.font = `500 ${opts.subSize || 11}px Inter, system-ui, sans-serif`;
      ctx.fillStyle = opts.subColor || '#64748b';
      ctx.fillText(opts.sub, x, y + 14);
    }
    ctx.restore();
  },
};
