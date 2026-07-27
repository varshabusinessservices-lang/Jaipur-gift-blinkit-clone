import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return (
    <div className={clsx('animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl', className)} />
  );
};
