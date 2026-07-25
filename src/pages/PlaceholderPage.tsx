import { PageHeader } from "../components/layout/PageHeader";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export function PlaceholderPage({ title, description = "This module will be implemented in future batches." }: PlaceholderPageProps) {
  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title={title} description={description} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 mb-4">
           <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
           </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">{title} Coming Soon</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          The {title.toLowerCase()} module is part of the application roadmap and will be developed in upcoming updates.
        </p>
      </div>
    </div>
  );
}
