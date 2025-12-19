'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface ProfileData {
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    avatar: "",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageRefresh, setImageRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState('settings');

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (profile.avatar) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//localhost:5000`;
      if (profile.avatar.startsWith('http')) {
        return `${profile.avatar}?refresh=${imageRefresh}`;
      } else if (profile.avatar.startsWith('/')) {
        return `${apiUrl}${profile.avatar}?refresh=${imageRefresh}`;
      } else {
        return `${apiUrl}/${profile.avatar}?refresh=${imageRefresh}`;
      }
    }
    return "";
  }, [file, profile.avatar, imageRefresh]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        setProfile({
          name: data.data.name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          bio: data.data.bio || "",
          avatar: data.data.avatar || "",
        });
      } catch (err: any) {
        setError(err.message || "Unable to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSaving(true);

    if (password && password !== confirmPassword) {
      setError("Passwords do not match");
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const formData = new FormData();
      formData.append("name", profile.name);
      formData.append("email", profile.email);
      formData.append("phone", profile.phone || "");
      formData.append("bio", profile.bio || "");
      if (password) {
        formData.append("password", password);
      }
      if (file) {
        formData.append("avatar", file);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      setProfile({
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
        bio: data.data.bio,
        avatar: data.data.avatar,
      });
      
      // Update local storage user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...data.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Dispatch event to update navbar
      window.dispatchEvent(new CustomEvent('userUpdated', { detail: { user: updatedUser } }));
      
      setImageRefresh(Date.now());
      setFile(null);
      setPassword("");
      setConfirmPassword("");
      setMessage("Profile updated successfully");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 text-center border-b border-gray-100">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 ring-4 ring-white shadow-lg">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-100 hover:bg-gray-50 transition"
                  >
                    📷
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    accept="image/*"
                  />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
              <nav className="p-2">
                {[
                  { id: 'settings', label: 'Account Settings', icon: '⚙️' },
                  { id: 'activity', label: 'Activity History', icon: 'clock' },
                  { id: 'billing', label: 'Billing & Plans', icon: '💳' },
                  { id: 'notifications', label: 'Notifications', icon: '🔔' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.icon === 'clock' ? '🕒' : item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              {activeTab === 'settings' && (
                <div>
                  <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Account Settings</h1>
                    <p className="text-gray-500">Manage your personal information and security preferences.</p>
                  </div>

                  {message && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
                      <span>✓</span> {message}
                    </div>
                  )}
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                      <span>⚠️</span> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                        <input
                          type="text"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                          placeholder="Tell us a bit about yourself"
                        />
                      </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                      <h3 className="text-lg font-bold text-gray-900 mb-6">Security</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="Leave blank to keep current"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            placeholder="Confirm new password"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20 ${
                          saving ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {saving ? 'Saving Changes...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'activity' && (
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Activity History</h1>
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                          📝
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">Course Completed</h4>
                          <p className="text-sm text-gray-600">You successfully completed "Advanced eBay Strategies"</p>
                          <span className="text-xs text-gray-400 mt-1 block">2 days ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Placeholders for other tabs */}
              {(activeTab === 'billing' || activeTab === 'notifications') && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🚧</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
                  <p className="text-gray-500">This section is currently under development.</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
