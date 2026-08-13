import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../api/profileApi';
import { productsApi } from '../api/productsApi';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Upload,
  X,
  Save,
  Loader2,
  ShieldCheck,
  Camera,
} from 'lucide-react';

export const ProfilePage = () => {
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Avatar upload state
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState(null); // { url, publicId }
  const fileInputRef = useRef(null);

  // ── Fetch profile from MongoDB backend on mount ────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        const data = await profileApi.getProfile();
        if (!isMounted) return;
        setProfile(data);
        setName(data.name || user?.name || '');
        setAvatarPreview(data.avatarUrl || user?.avatar || '');
      } catch (err) {
        console.error('Failed to load profile from backend:', err);
        if (!isMounted) return;
        setName(user?.name || '');
        setAvatarPreview(user?.avatar || '');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProfile();
    return () => { isMounted = false; };
  }, [user?.uid]);

  // ── Avatar upload ───────────────────────────────────────────────────────────
  const handleAvatarFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarUploading(true);
    try {
      const result = await productsApi.uploadImage(file); // upload to Cloudinary via FastAPI
      setPendingAvatar({ url: result.url, publicId: result.publicId });
    } catch (err) {
      console.error('Avatar upload failed:', err);
      showToast('Image upload failed. Please try again.', 'error');
      setAvatarPreview(profile?.avatarUrl || user?.avatar || '');
    } finally {
      setAvatarUploading(false);
    }
  }, [profile, user, showToast]);

  const handleAvatarInput = (e) => {
    if (e.target.files?.[0]) handleAvatarFile(e.target.files[0]);
    e.target.value = '';
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleAvatarFile(file);
  };

  const clearAvatar = () => {
    setAvatarPreview('');
    setPendingAvatar({ url: '', publicId: '' });
  };

  // ── Save changes to MongoDB ──────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) {
      showToast('Full name cannot be empty.', 'error');
      return;
    }
    if (avatarUploading) {
      showToast('Please wait for the image to finish uploading.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const payload = { name: name.trim() };
      if (pendingAvatar) {
        payload.avatarUrl = pendingAvatar.url;
        payload.avatarPublicId = pendingAvatar.publicId || '';
      }
      
      // PUT /api/v1/profile -> FastAPI -> MongoDB
      const updated = await profileApi.updateProfile(payload);
      
      // Update local state from response
      setProfile(updated);
      setName(updated.name);
      setAvatarPreview(updated.avatarUrl || '');
      setPendingAvatar(null);
      
      // Sync AuthContext so Navbar and global state update instantly
      if (refreshProfile) {
        await refreshProfile();
      }
      
      // Show success toast AFTER successful backend update
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Profile save failed:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to save profile. Please try again.';
      showToast(errorMsg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const initials = (nameStr) =>
    (nameStr || 'M')
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0].toUpperCase())
      .slice(0, 2)
      .join('');

  const displayName = name || user?.name || 'Store Admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your personal information and account settings.
        </p>
      </div>

      {/* ── Avatar Card ──────────────────────────────────────────────── */}
      <div className="seller-card p-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3 mb-5">
          <Camera className="w-4 h-4" />
          Profile Picture
        </h3>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar preview */}
          <div className="relative shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-blue-100 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-2xl flex items-center justify-center ring-4 ring-blue-100 shadow-lg">
                {initials(displayName)}
              </div>
            )}

            {/* Upload spinner overlay */}
            {avatarUploading && (
              <div className="absolute inset-0 rounded-2xl bg-slate-900/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              </div>
            )}

            {/* Remove button */}
            {avatarPreview && !avatarUploading && (
              <button
                onClick={clearAvatar}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow transition-colors"
                title="Remove picture"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Drag-and-drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingAvatar(true); }}
            onDragLeave={() => setIsDraggingAvatar(false)}
            onDrop={handleAvatarDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 w-full border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all select-none ${
              isDraggingAvatar
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarInput}
            />
            <div className="flex flex-col items-center gap-2 pointer-events-none">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                <Upload className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Click to upload or drag & drop
              </p>
              <p className="text-xs text-slate-400">PNG, JPG, WEBP · Max 10 MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Account Details Card ──────────────────────────────────────── */}
      <div className="seller-card p-6 space-y-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4" />
          Account Details
        </h3>

        {/* Full Name — editable */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition"
          />
        </div>

        {/* Email — read-only */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            Email Address
          </label>
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl">
            <span className="text-sm font-medium text-slate-600 flex-1 truncate">
              {user?.email || '—'}
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Email is managed by Firebase Auth and cannot be changed here.</p>
        </div>
      </div>

      {/* ── Save Button ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 pt-1 pb-6">
        <button
          onClick={handleSave}
          disabled={isSaving || avatarUploading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /><span>Saving...</span></>
          ) : (
            <><Save className="w-4 h-4" /><span>Save Changes</span></>
          )}
        </button>
      </div>
    </div>
  );
};
