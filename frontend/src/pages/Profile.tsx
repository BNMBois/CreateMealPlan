import React, { useEffect, useState } from "react";
import { User, Settings, Award } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:8000";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  const [proteinTarget, setProteinTarget] = useState<number>(140);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 🔐 Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // 🔥 Load profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken();

        const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        setProteinTarget(data?.proteinTarget ?? 140);
        setTags(data?.tags ?? []);
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // 💾 Save protein target (backend → Firestore)
  const saveProteinTarget = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const token = await user.getIdToken();

      await fetch(`${API_BASE_URL}/api/user/protein-target`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ proteinTarget }),
      });
    } catch (err) {
      console.error("Failed to save protein target:", err);
    } finally {
      setSaving(false);
    }
  };

  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  if (loading) {
    return <div className="p-10 text-center">Loading profile...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4" style={{ marginBottom: "2.5rem" }}>
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "white",
              textTransform: "uppercase",
            }}
          >
            {user?.displayName?.[0] ?? user?.email?.[0] ?? "U"}
          </span>
        </div>
        <div>
          <h2 className="text-2xl">{user?.displayName ?? "User"}</h2>
          <p className="text-muted">{user?.email}</p>
        </div>
      </div>

      {/* Dietary Goals */}
      <h3 className="text-xl" style={{ marginBottom: "1rem" }}>
        Dietary Goals
      </h3>
      <div className="glass-panel" style={{ marginBottom: "2rem" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="flex justify-between" style={{ marginBottom: "0.5rem" }}>
            <label className="label">Daily Protein Target</label>
            <span
              style={{
                color: "var(--accent-primary)",
                fontWeight: "bold",
              }}
            >
              {proteinTarget}g
            </span>
          </div>

          <input
            type="range"
            min={50}
            max={250}
            value={proteinTarget}
            onChange={(e) => setProteinTarget(Number(e.target.value))}
            onMouseUp={saveProteinTarget}
            onTouchEnd={saveProteinTarget}
            className="w-full"
            style={{ accentColor: "var(--accent-primary)" }}
          />

          {saving && (
            <p className="text-muted" style={{ marginTop: "0.5rem" }}>
              Saving...
            </p>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="badge"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--text-secondary)",
                color: "var(--text-secondary)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Settings */}
      <h3 className="text-xl" style={{ marginBottom: "1rem" }}>
        Settings
      </h3>
      <div className="glass-panel" style={{ padding: 0 }}>
        {[
          { icon: User, label: "Account Details" },
          { icon: Award, label: "Subscription" },
          { icon: Settings, label: "App Preferences" },
        ].map((item, i) => (
          <div
            key={i}
            style={{
              padding: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              borderBottom: i < 2 ? "1px solid var(--glass-border)" : "none",
              cursor: "pointer",
            }}
          >
            <item.icon className="text-muted" size={20} />
            <span style={{ flexGrow: 1 }}>{item.label}</span>
          </div>
        ))}
      </div>

      <button
        className="btn btn-secondary w-full"
        style={{
          marginTop: "2rem",
          borderColor: "var(--danger)",
          color: "var(--danger)",
        }}
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
};

export default Profile;