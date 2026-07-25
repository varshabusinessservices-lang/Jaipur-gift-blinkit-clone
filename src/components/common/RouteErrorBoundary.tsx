import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";

export function RouteErrorBoundary() {
  const error = useRouteError();
  
  let errorMessage = "An unexpected error occurred.";
  let errorDetails = "";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    errorDetails = `Status: ${error.status}`;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorDetails = error.stack || "";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h1>
        <p className="text-slate-600 text-sm mb-6">{errorMessage}</p>
        
        {import.meta.env.DEV && errorDetails && (
          <div className="mb-6 p-3 bg-slate-100 rounded-lg text-left overflow-auto max-h-48 text-xs font-mono text-slate-800">
            {errorDetails}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
          <Link
            to="/admin/dashboard"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
