import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  cutCorner?: boolean;
}

const SIZE_CLASSES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  size = 'md',
  cutCorner = true,
  className = '',
  ...rest
}) => {
  return (
    <button
      className={`btn-primary ${cutCorner ? 'vct-cut-sm' : 'rounded-sm'} font-mono-vct font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};
