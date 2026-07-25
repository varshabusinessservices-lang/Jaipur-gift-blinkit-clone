import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore";
import { config } from "../../../config/env";
import { authService } from "../../../services/authService";
import { Gift, Eye, EyeOff, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false }
  });

  const handleFillCredentials = () => {
    setValue("email", "admin@example.com", { shouldValidate: true });
    setValue("password", "Admin@123", { shouldValidate: true });
    setAuthError(null);
  };

  const handleInputChange = () => {
    if (authError) {
      setAuthError(null);
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login(data);
      setAuth(response.user, response.accessToken, response.refreshToken);
      toast.success("Login successful");
      navigate("/admin/dashboard", { replace: true });
    } catch (error: any) {
      const msg = error.message || "Invalid credentials";
      setAuthError(msg);
      toast.error(msg, { id: 'login-error' });
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
            Sign in to admin
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {config.appName}
          </p>
        </div>

        {/* Development Credential Panel - ONLY shown when mock mode is true */}
        {config.useMockApi && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-900 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="font-semibold text-blue-900">Development Credentials</p>
              <button
                type="button"
                onClick={handleFillCredentials}
                className="text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 shadow-sm transition-colors cursor-pointer"
              >
                Fill development credentials
              </button>
            </div>
            <div className="text-xs space-y-0.5 text-blue-800">
              <p><span className="font-medium">Email:</span> admin@example.com</p>
              <p><span className="font-medium">Password:</span> Admin@123</p>
            </div>
          </div>
        )}

        {/* Auth Alert Box - Cleared on user edit or retry */}
        {authError && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{authError}</p>
              <p className="text-red-600 mt-0.5">Please check your email and password and try again.</p>
            </div>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-700">
                Email address
              </label>
              <input
                id="email-address"
                type="email"
                autoComplete="email"
                {...register("email", { onChange: handleInputChange })}
                className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mt-1 ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                placeholder="admin@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password", { onChange: handleInputChange })}
                  className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10 ${errors.password ? 'border-red-500' : 'border-slate-300'}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-500"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-900">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link to="/admin/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
