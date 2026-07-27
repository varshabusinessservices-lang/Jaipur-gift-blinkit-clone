import React from "react";
import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../../store/authStore';
import { apiClient } from '../../../lib/axios';
import { toast } from 'sonner';
import { Camera, Mail, Key, Monitor, Activity, User as UserIcon, Trash2, CheckCircle2, Shield, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch detailed profile to sync state
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data.success && res.data.data) {
          const u = res.data.data;
          setName(u.name);
          setMobile(u.mobile || '');
          updateUser({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            mobile: u.mobile,
            avatarUrl: u.avatarUrl,
            status: u.status,
            isSuperAdmin: u.isSuperAdmin,
            emailVerifiedAt: u.emailVerifiedAt,
            lastLoginAt: u.lastLoginAt,
            passwordChangedAt: u.passwordChangedAt,
            createdAt: u.createdAt,
          });
        }
      } catch (err) {
        console.error("Failed to fetch detailed profile", err);
      }
    };
    fetchProfile();
  }, [updateUser]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await apiClient.patch('/admin/profile', { name, mobile });
      if (res.data.success) {
        toast.success('Profile updated successfully');
        updateUser({ name: res.data.data.name, mobile: res.data.data.mobile });
        setIsEditing(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.type)) {
      toast.error('Only JPEG, PNG and WebP images are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await apiClient.post('/admin/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success('Avatar updated successfully');
        const newAvatarUrl = res.data.data?.url || null;
        updateUser({ avatarUrl: newAvatarUrl });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const res = await apiClient.delete('/admin/profile/avatar');
      if (res.data.success) {
        toast.success('Avatar removed');
        updateUser({ avatarUrl: null });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove avatar');
    }
  };

  if (!user) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Super Admin Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your administrator account settings, personal details, and security configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Navigation & Quick Summary Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="relative inline-block">
              <div className="h-28 w-28 rounded-full bg-indigo-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-md mx-auto">
                 {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                 ) : (
                    <span className="text-3xl font-bold text-indigo-600">{user.name?.charAt(0) || 'A'}</span>
                 )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Change Avatar"
                className="absolute bottom-0 right-0 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white shadow hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg, image/png, image/webp" onChange={handleAvatarChange} />
            </div>

            {user.avatarUrl && (
              <div className="mt-2">
                <button 
                  onClick={handleDeleteAvatar} 
                  className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" /> Remove avatar
                </button>
              </div>
            )}
            
            <h2 className="mt-4 text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            
            <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                <Shield className="h-3 w-3 mr-1 text-amber-600" /> Super Admin
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" /> {user.status || 'ACTIVE'}
              </span>
            </div>
          </div>

          <nav className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 space-y-1">
            <a href="#overview" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700">
              <UserIcon className="h-4 w-4 mr-3 text-indigo-600" />
              Profile Overview
            </a>
            <a href="#personal-info" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50">
              <UserIcon className="h-4 w-4 mr-3 text-slate-400" />
              Personal Information
            </a>
            <Link to="/admin/profile/security/email" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50">
              <Mail className="h-4 w-4 mr-3 text-slate-400" />
              Email Address & Change
            </Link>
            <Link to="/admin/profile/security/password" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50">
              <Key className="h-4 w-4 mr-3 text-slate-400" />
              Password & Security
            </Link>
            <Link to="/admin/profile/sessions" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50">
              <Monitor className="h-4 w-4 mr-3 text-slate-400" />
              Active Sessions
            </Link>
            <Link to="/admin/profile/security-activity" className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-50">
              <Activity className="h-4 w-4 mr-3 text-slate-400" />
              Security Activity
            </Link>
          </nav>
        </div>

        {/* Right Section Details */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Section 1: Overview Metadata */}
          <div id="overview" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="h-4 w-4 text-indigo-600" />
                Profile Overview & Metadata
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Role</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>Super Admin</span>
                  <span className="text-xs font-normal text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Full Access</span>
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Status</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {user.status || 'ACTIVE'}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Email Verification Status</p>
                <p className="mt-1 text-sm font-medium text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Verified
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Last Login</p>
                <p className="mt-1 text-sm text-slate-900 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" /> {formatDate(user.lastLoginAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Password Last Changed</p>
                <p className="mt-1 text-sm text-slate-900 flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-slate-400" /> {formatDate(user.passwordChangedAt)}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Created</p>
                <p className="mt-1 text-sm text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" /> {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Personal Information */}
          <div id="personal-info" className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-3">
                  <button 
                    onClick={() => { setIsEditing(false); setName(user.name); setMobile(user.mobile || ''); }} 
                    className="text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving} 
                    className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                  />
                ) : (
                  <p className="mt-1 text-sm font-semibold text-slate-900">{user.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={mobile} 
                    onChange={e => setMobile(e.target.value)} 
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    placeholder="e.g. +91 9876543210" 
                  />
                ) : (
                  <p className="mt-1 text-sm text-slate-900">{user.mobile || 'Not provided'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email Address</label>
                <div className="mt-1 flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-500">Primary email for account access & notifications</p>
                  </div>
                  <Link 
                    to="/admin/profile/security/email" 
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white px-3 py-1.5 rounded border border-slate-200 shadow-sm"
                  >
                    Change Email
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3, 4, 5, 6 Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/admin/profile/security/password"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Key className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900">Password & Security</h4>
              </div>
              <p className="text-xs text-slate-500">Change your password using two-factor email OTP verification.</p>
            </Link>

            <Link 
              to="/admin/profile/sessions"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Monitor className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900">Active Sessions</h4>
              </div>
              <p className="text-xs text-slate-500">View logged-in devices and revoke unauthorized session tokens.</p>
            </Link>

            <Link 
              to="/admin/profile/security-activity"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group sm:col-span-2"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Activity className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-slate-900">Security Audit Logs</h4>
              </div>
              <p className="text-xs text-slate-500">Track logins, password changes, session revocations, and profile updates.</p>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
