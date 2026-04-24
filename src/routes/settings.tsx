import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { motion } from "framer-motion";
import { User, Lock, Globe, Shield, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api-client";

const tabs = [
  { id: "general",  label: "General",  icon: Globe   },
  { id: "profile",  label: "Profile",  icon: User    },
  { id: "security", label: "Security", icon: Shield  },
] as const;

type Tab = (typeof tabs)[number]["id"];

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  store_name: string | null;
  bio: string | null;
}

export function SettingsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab]           = useState<Tab>("general");
  const [showNew, setShowNew]               = useState(false);
  const [showConfirm, setShowConfirm]       = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [storeName, setStoreName]           = useState("");
  const [fullName, setFullName]             = useState("");
  const [bio, setBio]                       = useState("");
  const [email, setEmail]                   = useState("");
  const [userId, setUserId]                 = useState("");

  const [newPassword, setNewPassword]       = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingStore, setSavingStore]       = useState(false);
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    apiFetch<Profile>("/profile")
      .then(data => {
        setEmail(data.email ?? "");
        setFullName(data.full_name ?? "");
        setStoreName(data.store_name ?? "");
        setBio(data.bio ?? "");
        setUserId(data.id ?? "");
      })
      .catch(() => {
        setEmail(user?.email ?? "");
        setFullName(user?.full_name ?? "");
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  async function saveStore() {
    setSavingStore(true);
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ store_name: storeName }),
      });
      toast.success("Store settings saved");
    } catch {
      toast.error("Failed to save store settings");
    } finally {
      setSavingStore(false);
    }
  }

  async function saveProfile() {
    setSavingProfile(true);
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({ full_name: fullName, bio }),
      });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword() {
    if (newPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setSavingPassword(true);
    try {
      await apiFetch("/profile/password", {
        method: "PUT",
        body: JSON.stringify({ new_password: newPassword }),
      });
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  }

  const avatarInitials = (fullName || email || "AD")
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account and preferences</p>
        </div>

        <div className="flex gap-1 rounded-lg border border-border bg-accent/20 p-1 w-fit mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-card text-card-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="max-w-2xl">
          {activeTab === "general" && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-card-foreground">Store Settings</h2>
                    <p className="text-sm text-muted-foreground">Configure your store details</p>
                  </div>
                </div>
                {loadingProfile ? (
                  <div className="h-10 rounded-lg bg-accent/30 animate-pulse" />
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Store Name</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      maxLength={100}
                      className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    />
                  </div>
                )}
                <button
                  onClick={saveStore}
                  disabled={savingStore || loadingProfile}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {savingStore ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-card-foreground">Profile Information</h2>
                    <p className="text-sm text-muted-foreground">Update your personal information</p>
                  </div>
                </div>

                {loadingProfile ? (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-accent/30 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 rounded bg-accent/30 animate-pulse" />
                      <div className="h-3 w-28 rounded bg-accent/30 animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-xl font-bold text-primary">
                      {avatarInitials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Account ID: {userId ? `${userId.slice(0, 8)}…` : "—"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Full Name</label>
                    {loadingProfile ? (
                      <div className="h-10 rounded-lg bg-accent/30 animate-pulse" />
                    ) : (
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        maxLength={200}
                        className="h-10 w-full rounded-lg border border-input bg-input px-3 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="h-10 w-full rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Bio</label>
                    {loadingProfile ? (
                      <div className="h-20 rounded-lg bg-accent/30 animate-pulse" />
                    ) : (
                      <textarea
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={1000}
                        className="w-full rounded-lg border border-input bg-input px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring resize-none"
                      />
                    )}
                  </div>
                </div>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile || loadingProfile}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Lock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-card-foreground">Change Password</h2>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="h-10 w-full rounded-lg border border-input bg-input px-3 pr-10 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1.5">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="h-10 w-full rounded-lg border border-input bg-input px-3 pr-10 text-sm text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                      />
                      <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={changePassword}
                  disabled={savingPassword}
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
                >
                  {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Update Password
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
