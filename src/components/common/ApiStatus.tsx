import { useEffect, useState } from "react";
import { apiClient } from "../../lib/axios";
import { cn } from "../../lib/utils";

export function ApiStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "unavailable">("checking");

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await apiClient.get("/health");
        if (response.data.success) {
          setStatus("connected");
        } else {
          setStatus("unavailable");
        }
      } catch (error) {
        setStatus("unavailable");
      }
    };

    checkHealth();
  }, []);

  const getStatusDisplay = () => {
    switch (status) {
      case "connected":
        return { label: "REAL API", dotClass: "bg-green-500" };
      case "unavailable":
        return { label: "API Unavailable", dotClass: "bg-red-500" };
      default:
        return { label: "Checking...", dotClass: "bg-gray-400 animate-pulse" };
    }
  };

  const display = getStatusDisplay();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/50 border border-slate-200">
      <span className={cn("w-2 h-2 rounded-full", display.dotClass)} />
      <span className="text-[10px] font-medium text-slate-600 uppercase tracking-wider">
        {display.label}
      </span>
    </div>
  );
}

