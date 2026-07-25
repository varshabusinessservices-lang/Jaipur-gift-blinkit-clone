import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="text-6xl font-extrabold text-indigo-600 mb-4">404</h1>
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/admin/dashboard" 
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-sm hover:bg-indigo-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
