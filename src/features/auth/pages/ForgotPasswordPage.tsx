import { useState } from "react";
import { Link } from "react-router-dom";
import { Gift } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authService } from "../../../services/authService";
import { toast } from "sonner";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
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
            Forgot Password
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Enter your email to receive a reset link.
          </p>
        </div>
        
        {isSuccess ? (
          <div className="bg-green-50 text-green-800 p-4 rounded-lg border border-green-200">
            <p>If an account with that email exists, we have sent a password reset link to it.</p>
            <div className="mt-4 text-center">
              <Link to="/admin/login" className="font-medium text-indigo-600 hover:text-indigo-500">Return to Login</Link>
            </div>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email address</label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`appearance-none block w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm mt-1 ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email?.message as string}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center text-sm">
               <Link to="/admin/login" className="font-medium text-indigo-600 hover:text-indigo-500">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
