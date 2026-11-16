import React from 'react';

interface StatPillProps {
  label: string;
  value: React.ReactNode;
  color?: string;
  title?: string;
}

export const StatPill: React.FC<StatPillProps> = ({
  label,
  value,
  color = '#e2b714',
  title,
}) => {
  return (
    <div
      title={title}
      className="glass-film flex items-center gap-2 px-3 py-1.5 rounded-xl"
    >
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
      <span className="font-mono-vct text-xs font-semibold uppercase tracking-wider text-slate-200">
        {label}
      </span>
      <span className="font-mono-vct text-base font-bold leading-none" style={{ color }}>
        {value}
      </span>
    </div>
  );
};
