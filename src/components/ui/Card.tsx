import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive' | 'modal';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  cutCorner?: boolean;
}

const PADDING_MAP = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  cutCorner = false,
  className = '',
  ...rest
}) => {
  const variantCls =
    variant === 'subtle'
      ? 'surface-sub'
      : variant === 'modal'
      ? 'glass-modal'
      : variant === 'interactive'
      ? 'surface-card surface-card-interactive'
      : 'surface-card';

  const cutCls = cutCorner ? 'vct-cut' : '';

  return (
    <div className={`${variantCls} ${cutCls} ${PADDING_MAP[padding]} ${className}`} {...rest}>
      {children}
    </div>
  );
};
