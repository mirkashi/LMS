"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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

  const previewUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (profile.avatar) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
        formData.append("confirmPassword", confirmPassword);
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

      setMessage("Profile updated successfully");
      setPassword("");
      setConfirmPassword("");
      setFile(null);
      setImageRefresh(Date.now());
      setProfile({
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone || "",
        bio: data.data.bio || "",
        avatar: data.data.avatar || "",
      });

      // Sync localStorage user snapshot for navbar dropdown
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        const updatedUser = { ...parsed, name: data.data.name, email: data.data.email, avatar: data.data.avatar };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        // Trigger storage event for navbar update
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(updatedUser),
        }));
      }
    } catch (err: any) {
      setError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.6s ease-out forwards;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.2s; opacity: 0; }
        .stagger-3 { animation-delay: 0.3s; opacity: 0; }
      `}</style>
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4 animate-fade-in-up">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary font-semibold">Profile</p>
            <h1 className="text-4xl font-bold text-gray-900 mt-2">Account & Identity</h1>
            <p className="text-gray-600 mt-2">Keep your personal information polished and up to date.</p>
          </div>
          <div className="flex items-center space-x-3 bg-white shadow-sm border border-gray-100 rounded-full px-4 py-2 animate-slide-in-right">
            <div className="w-10 h-10 rounded-full bg-gradient-primary text-white flex items-center justify-center font-semibold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{profile.name || "User"}</p>
              <p className="text-xs text-gray-500">{profile.email}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 animate-slide-in-left stagger-1">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 sticky top-24 space-y-6 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm bg-gray-50 transition-transform hover:scale-105 duration-300">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">👤</div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-500">Profile photo</p>
                  <p className="text-base font-semibold text-gray-900">{profile.name || "User"}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-center px-4 py-3 rounded-lg border border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition"
              >
                Upload new photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">PNG, JPG, or WEBP. Max 5MB.</p>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <p className="text-sm font-semibold text-gray-900">Tips</p>
                <p className="text-sm text-gray-600">Use a clear, centered headshot. This appears in your navigation dropdown.</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 animate-slide-in-right stagger-2">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 space-y-6 hover:shadow-md transition-shadow duration-300">
              {message && (
                <div className="rounded-md bg-green-50 p-4 text-green-700 border border-green-200 text-sm animate-fade-in-up">
                  {message}
                </div>
              )}
              {error && (
                <div className="rounded-md bg-red-50 p-4 text-red-700 border border-red-200 text-sm animate-fade-in-up">
                  {error}
                </div>
              )}

              <form className="space-y-8" onSubmit={handleSubmit}>
                <section className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-gray-500">Your name and contact details.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 transform transition-transform hover:scale-105 duration-300">
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        required
                      />
                    </div>
                    <div className="space-y-2 transform transition-transform hover:scale-105 duration-300">
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        required
                      />
                    </div>
                    <div className="space-y-2 transform transition-transform hover:scale-105 duration-300">
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={profile.phone || ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        placeholder="e.g. +1 555 123 4567"
                      />
                    </div>
                    <div className="space-y-2 transform transition-transform hover:scale-105 duration-300">
                      <label className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        value={profile.bio || ""}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        rows={3}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                  </div>
                </section>

                <section className="space-y-4 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                    <p className="text-sm text-gray-500">Update your password when needed.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 transform transition-transform hover:scale-105 duration-300">
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        placeholder="Leave blank to keep current"
                      />
                    </div>
                    <div className="space-y-2 transform transition-transform hover:scale-105 duration-300">
                      <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition"
                        placeholder="Retype new password"
                      />
                    </div>
                  </div>
                </section>

                <div className="flex items-center justify-between pt-2 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
                  <div className="text-sm text-gray-500">Your changes will be reflected across the platform.</div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition disabled:opacity-60 transform hover:scale-105 duration-200"
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
