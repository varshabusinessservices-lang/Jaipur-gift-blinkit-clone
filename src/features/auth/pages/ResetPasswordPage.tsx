import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Gift, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../../../services/authService";
import { toast } from "sonner";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: any) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      return;
    }
    
    setIsLoading(true);
    try {
      await authService.resetPassword({ token, password: data.password });
      toast.success("Password reset successfully. Please login.");
      navigate("/admin/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-100 flex items-center justify-center rounded-xl">
             <Gift className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
            Reset Password
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-sm font-medium text-slate-700">New Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm ${errors.password ? 'border-red-500' : 'border-slate-300'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-500"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password?.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 sm:text-sm mt-1 ${errors.confirmPassword ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword?.message as string}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
