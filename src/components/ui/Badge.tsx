import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'red' | 'gold' | 'cyan' | 'green' | 'purple';
  className?: string;
  title?: string;
}

const TONE_CLASSES: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-white/[0.05] border-white/10 text-slate-200',
  red: 'bg-[#ff4655]/15 border-[#ff4655]/40 text-[#ff8a93]',
  gold: 'bg-[#e2b714]/15 border-[#e2b714]/40 text-[#f3d459]',
  cyan: 'bg-[#38bdf8]/15 border-[#38bdf8]/40 text-[#7dd3fc]',
  green: 'bg-[#10b981]/15 border-[#10b981]/40 text-[#6ee7b7]',
  purple: 'bg-[#a855f7]/15 border-[#a855f7]/40 text-[#d8b4fe]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  tone = 'neutral',
  className = '',
  title,
}) => {
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border font-mono-vct text-xs font-bold uppercase tracking-wider ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
};
