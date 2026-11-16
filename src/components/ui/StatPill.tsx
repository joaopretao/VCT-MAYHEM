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
      className="surface-sub flex items-center gap-2 px-3 py-1.5"
    >
      <span
        className="w-1.5 h-3.5 rounded-[1px] shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="font-mono-vct text-xs font-semibold uppercase tracking-wider text-slate-300">
        {label}
      </span>
      <span className="font-mono-vct text-base font-bold leading-none" style={{ color }}>
        {value}
      </span>
    </div>
  );
};
