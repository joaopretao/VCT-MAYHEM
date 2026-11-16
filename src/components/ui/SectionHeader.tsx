import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  subtitle,
  rightSlot,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-4 ${className}`}>
      <div>
        {eyebrow && (
          <span className="block font-mono-vct text-xs font-bold uppercase tracking-widest text-[#e2b714] mb-0.5">
            {eyebrow}
          </span>
        )}
        <div className="flex items-center gap-2.5">
          <span className="vct-slash" aria-hidden />
          <h2 className="font-display text-2xl sm:text-3xl leading-none text-white tracking-wide uppercase">
            {title}
          </h2>
        </div>
        {subtitle && <p className="text-xs sm:text-sm text-slate-300 mt-1">{subtitle}</p>}
      </div>
      {rightSlot && <div className="flex items-center gap-2 flex-wrap">{rightSlot}</div>}
    </div>
  );
};
