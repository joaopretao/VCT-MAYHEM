import React from 'react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASSES = {
  sm: 'px-3 py-1.5 text-xs rounded-[3px]',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-[3px]',
  lg: 'px-5 py-2.5 text-sm rounded-[3px]',
};

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  size = 'md',
  className = '',
  ...rest
}) => {
  return (
    <button
      className={`bg-[#161b24] hover:bg-[#1e2531] active:scale-[0.99] border border-white/10 hover:border-white/25 text-slate-200 hover:text-white font-mono-vct font-semibold tracking-wide inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
