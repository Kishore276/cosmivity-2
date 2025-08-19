
import { cn } from '@/lib/utils';
import React from 'react';

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'sidebar' | 'auto';
  variant?: 'image' | 'text';
}

export function Logo({
  className,
  size = 'auto',
  variant = 'image',
  ...props
}: LogoProps) {
  const imageSizeClasses = {
    sm: 'h-10 w-32',     // Increased for better mobile visibility
    md: 'h-14 w-48',     // Back to larger width for better look
    lg: 'h-16 w-52',     // Larger width for bigger screens
    xl: 'h-18 w-56',     // Even larger for extra large screens
    sidebar: 'h-14 w-48', // Back to larger width for better visibility
    auto: 'h-14 w-48'    // Default to larger size
  };

  return (
    <div className={cn('flex items-center', className)} {...props}>
      <img
        src="/logo.png"
        alt="Cosmivity Logo"
        className={cn(
          'transition-transform group-hover:scale-105 select-none object-cover object-center scale-125',
          imageSizeClasses[size]
        )}
      />
    </div>
  );
}

    