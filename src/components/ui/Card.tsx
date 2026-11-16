import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
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
  className = '',
  ...rest
}) => {
  const variantCls =
    variant === 'subtle'
      ? 'glass-film'
      : variant === 'interactive'
      ? 'glass glass-hover'
      : 'glass';

  return (
    <div className={`${variantCls} ${PADDING_MAP[padding]} ${className}`} {...rest}>
      {children}
    </div>
  );
};
