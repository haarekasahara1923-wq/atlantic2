"use client";
import { useState, useEffect, useRef } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultSettings = [
    { key: "school_name", label: "School Name", placeholder: "Atlantic-2 School" },
    { key: "school_tagline", label: "School Tagline", placeholder: "Nurturing Minds, Building Futures" },
    { key: "established_year", label: "Established Year", placeholder: "1990" },
    { key: "principal_name", label: "Principal Name", placeholder: "Dr. XYZ" },
    { key: "admission_open", label: "Admissions Open? (yes/no)", placeholder: "yes" },
  ];

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const map: Record<string, string> = {};
          data.settings.forEach((s: any) => { map[s.key] = s.value || ""; });
          setSettings(map);
        }
        setLoading(false);
      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please select a logo smaller than 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    
    let updatedSettings = { ...settings };

    try {
      if (selectedFile) {
        setMsg("Uploading logo...");
        const sigRes = await fetch("/api/cloudinary-sign");
        const sigData = await sigRes.json();
        
        if (!sigRes.ok || !sigData.signature) {
          throw new Error(sigData.error || "Failed to get upload signature");
        }
        
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("api_key", sigData.apiKey);
        formData.append("timestamp", sigData.timestamp);
        formData.append("signature", sigData.signature);
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
          method: "POST",
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error?.message || "Cloudinary upload failed");
        
        updatedSettings["school_logo_url"] = uploadData.secure_url;
        setSettings(updatedSettings); // Update local state so preview updates
      }
      
      setMsg("Saving settings...");

      const entries = Object.entries(updatedSettings).map(([key, value]) => ({ key, value }));
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: entries }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMsg("Settings saved successfully!");
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        setMsg("Error: " + (data.error || "Unknown"));
      }
    } catch (err: any) {
      setMsg("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const fieldStyle: React.CSSProperties = { width: "100%", padding: "12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "1rem", boxSizing: "border-box" };
  const labelStyle: React.CSSProperties = { display: "block", marginBottom: "6px", fontWeight: "600", color: "#444" };

  return (
    <div>
      <h1 style={{ fontSize: "2rem", color: "var(--secondary-color)", marginBottom: "30px" }}>⚙️ Site Settings</h1>

      {msg && (
        <div style={{ padding: "12px", borderRadius: "6px", marginBottom: "20px", background: msg.startsWith("Error") ? "#ffebee" : "#e8f5e9", color: msg.startsWith("Error") ? "#c62828" : "#2e7d32", fontWeight: msg.includes("Uploading") ? "bold" : "normal" }}>
          {msg}
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div style={{ background: "white", borderRadius: "12px", padding: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", maxWidth: "700px" }}>
          
          <div style={{ marginBottom: "30px", paddingBottom: "20px", borderBottom: "1px solid #eee" }}>
            <label style={labelStyle}>School Logo</label>
            <div style={{ display: "flex", gap: "20px", alignItems: "center", marginBottom: "10px" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "#f0f0f0", overflow: "hidden", border: "1px solid #ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {settings["school_logo_url"] ? (
                  <img src={settings["school_logo_url"]} alt="Logo Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#888" }}>No Logo</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={fieldStyle}
                />
                {selectedFile && <p style={{ margin: "5px 0 0", fontSize: "0.8rem", color: "green" }}>{selectedFile.name} selected.</p>}
              </div>
            </div>
          </div>

          {defaultSettings.map(({ key, label, placeholder }) => (
            <div key={key} style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>{label}</label>
              <input
                value={settings[key] || ""}
                onChange={e => setSettings({ ...settings, [key]: e.target.value })}
                placeholder={placeholder}
                style={fieldStyle}
              />
            </div>
          ))}

          <button onClick={handleSave} disabled={saving}
            style={{ padding: "12px 30px", background: "#1a237e", color: "#ffffff", border: "none", borderRadius: "8px", fontSize: "1rem", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving..." : "💾 Save Settings"}
          </button>
        </div>
      )}
    </div>
  );
}
