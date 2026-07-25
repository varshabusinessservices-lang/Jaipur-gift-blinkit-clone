import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  icon: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-gray-100 shadow-sm", className)}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-6">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
