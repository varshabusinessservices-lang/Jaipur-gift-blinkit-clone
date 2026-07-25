import { ReactNode } from "react";

interface DataTableShellProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function DataTableShell({ title, description, actions, children }: DataTableShellProps) {
  return (
    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
      {(title || actions) && (
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && <h3 className="text-base font-semibold leading-6 text-gray-900">{title}</h3>}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      <div className="overflow-x-auto">
        {children}
      </div>
    </div>
  );
}
