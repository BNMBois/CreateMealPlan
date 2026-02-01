import React, { useState } from "react";
import { auth } from "../firebase";
import { API_BASE_URL } from "../config";

const ReceiptScanner: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleScan = async () => {
    if (!file) {
      setMessage("Please select a receipt image.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User not authenticated");

      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/api/scanner/scan`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Scan failed");
      }

      const data = await res.json();
      setMessage(`Added ${data.items.length} items to pantry ✅`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to scan receipt ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h2 className="text-xl mb-4">Scan Receipt</h2>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button
        className="btn btn-primary mt-4"
        onClick={handleScan}
        disabled={loading}
      >
        {loading ? "Scanning..." : "Upload & Scan"}
      </button>

      {message && (
        <p className="mt-3 text-sm text-muted">
          {message}
        </p>
      )}
    </div>
  );
};

export default ReceiptScanner;
