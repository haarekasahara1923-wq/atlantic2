"use client";
import { useState, useEffect } from "react";

export default function HeroSettings() {
  const [gallery, setGallery] = useState<any[]>([]);
  const [currentHero, setCurrentHero] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/gallery").then(r => r.json()),
      fetch("/api/settings").then(r => r.json())
    ]).then(([galleryData, settingsData]) => {
      if (galleryData.success) {
        setGallery(galleryData.items.filter((item: any) => item.type === "photo"));
      }
      if (settingsData.success) {
        const heroSetting = settingsData.settings.find((s: any) => s.key === "hero_image_url");
        if (heroSetting) {
          setCurrentHero(heroSetting.value);
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleSelect = async (url: string) => {
    setCurrentHero(url);
    setSaving(true);
    setMsg("");
    
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: [{ key: "hero_image_url", value: url }] }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg("Hero image updated successfully!");
      } else {
        setMsg("Error updating hero image.");
      }
    } catch (err: any) {
      setMsg("Error: " + err.message);
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 style={{ fontSize: "2rem", color: "var(--secondary-color)", marginBottom: "20px" }}>🖼️ Hero Image Settings</h1>
      <p style={{ marginBottom: "20px" }}>Select an image from the gallery to set as the background for the home page hero section.</p>

      {msg && (
        <div style={{ padding: "12px", borderRadius: "6px", marginBottom: "20px", background: msg.includes("Error") ? "#ffebee" : "#e8f5e9", color: msg.includes("Error") ? "#c62828" : "#2e7d32" }}>
          {msg}
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div>
          <div style={{ marginBottom: "30px" }}>
            <h3>Current Hero Image:</h3>
            {currentHero ? (
              <img src={currentHero} alt="Current Hero" style={{ width: "100%", maxWidth: "600px", height: "300px", objectFit: "cover", borderRadius: "12px", marginTop: "10px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
            ) : (
              <p>No custom hero image set (using default).</p>
            )}
          </div>
          
          <h3>Select from Gallery:</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "20px", marginTop: "15px" }}>
            {gallery.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleSelect(item.cloudinaryUrl)}
                style={{ 
                  cursor: "pointer", 
                  border: currentHero === item.cloudinaryUrl ? "4px solid var(--primary-color)" : "2px solid transparent",
                  borderRadius: "12px",
                  overflow: "hidden",
                  transition: "all 0.2s"
                }}
              >
                <img src={item.cloudinaryUrl} alt={item.title} style={{ width: "100%", height: "150px", objectFit: "cover", display: "block" }} />
              </div>
            ))}
            {gallery.length === 0 && <p>No photos found in gallery. Please add photos to the gallery first.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
