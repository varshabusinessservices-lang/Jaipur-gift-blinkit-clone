import { useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiClient } from "../../../lib/axios";
import { toast } from "sonner";
import { User, Mail, Shield, Smartphone } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z.string().optional(),
});

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      mobile: "", // You could fetch this from the actual profile
    }
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.put("/auth/profile", data);
      if (response.data.success) {
        updateUser(response.data.data);
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-200 bg-slate-50 flex items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-3xl font-bold border-4 border-white shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-medium">
              <Mail className="h-4 w-4" />
              {user?.email}
            </div>
            <div className="flex items-center gap-2 mt-1 text-slate-500 text-sm font-medium">
              <Shield className="h-4 w-4" />
              Role: <span className="uppercase text-xs font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{user?.role}</span>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Personal Information</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input
                type="text"
                {...register("name")}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${errors.name ? 'border-red-500' : 'border-slate-300'}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name?.message as string}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  {...register("mobile")}
                  className="block w-full pl-10 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
