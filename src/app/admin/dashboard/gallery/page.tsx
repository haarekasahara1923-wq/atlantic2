"use client";
import { useState, useEffect, useRef } from "react";

export default function AdminGallery() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addType, setAddType] = useState<"photo" | "video">("photo");

  const [newItem, setNewItem] = useState({
    title: "",
    category: "General",
    description: "",
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/gallery");
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setMsg("");
    try {
      const res = await fetch(`/api/gallery?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMsg("Item deleted successfully!");
        fetchItems();
      } else {
        setMsg("Error: " + (data.error || "Delete failed"));
      }
    } catch (err) {
      setMsg("Error deleting item");
    }
  };

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(item => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} items?`)) return;
    setMsg("");
    try {
      const res = await fetch(`/api/gallery?ids=${selectedIds.join(',')}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMsg(`${selectedIds.length} items deleted successfully!`);
        setSelectedIds([]);
        fetchItems();
      } else {
        setMsg("Error: " + (data.error || "Delete failed"));
      }
    } catch (err) {
      setMsg("Error deleting items");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const oversized = files.find(file => file.size > 50 * 1024 * 1024);
    if (oversized) {
      alert("One or more files are too large. Please select files smaller than 50MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFiles(files);
    
    // Auto-fill title if single file
    if (files.length === 1) {
      setNewItem({ ...newItem, title: files[0].name.split('.')[0] });
    } else {
      setNewItem({ ...newItem, title: "" });
    }
  };

  const handleSaveManual = async () => {
    if (selectedFiles.length === 0) {
      setMsg("Error: Media file(s) are required.");
      return;
    }
    
    // If a single file, title is required. If multiple, we can auto-generate.
    if (selectedFiles.length === 1 && !newItem.title.trim()) {
      setMsg("Error: Title is required for single file upload.");
      return;
    }

    setSaving(true);
    setMsg(`Uploading ${selectedFiles.length} file(s) to Cloudinary... This may take a while.`);
    
    try {
      const sigRes = await fetch("/api/cloudinary-sign");
      const sigData = await sigRes.json();
      
      if (!sigRes.ok || !sigData.signature) {
        throw new Error(sigData.error || "Failed to get upload signature. Backend not configured properly.");
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setMsg(`Uploading ${i + 1} of ${selectedFiles.length}: ${file.name}...`);
        
        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", sigData.apiKey);
        formData.append("timestamp", sigData.timestamp);
        formData.append("signature", sigData.signature);
        
        const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
          method: "POST",
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) {
          throw new Error(uploadData.error?.message || "Cloudinary upload failed for " + file.name);
        }

        setMsg(`Saving ${i + 1} of ${selectedFiles.length} to database...`);

        let itemTitle = newItem.title.trim();
        if (selectedFiles.length > 1 || !itemTitle) {
          itemTitle = file.name.split('.')[0];
        }

        const res = await fetch("/api/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: itemTitle,
            type: addType,
            cloudinaryUrl: uploadData.secure_url,
            cloudinaryPublicId: uploadData.public_id,
            thumbnailUrl: uploadData.thumbnail_url || uploadData.secure_url,
            category: newItem.category.trim() || "General",
            description: newItem.description.trim(),
          }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "Failed to save media to DB for " + file.name);
        }
      }

      setMsg(`${selectedFiles.length} item(s) added successfully!`);
      setShowAddModal(false);
      setNewItem({ title: "", category: "General", description: "" });
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchItems();
    } catch (err: any) {
      setMsg("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const openModalFor = (type: "photo" | "video") => {
    setAddType(type);
    setNewItem({ title: "", category: "General", description: "" });
    setSelectedFiles([]);
    setShowAddModal(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--secondary-color)' }}>Gallery Manager</h1>
        
        <div style={{ display: "flex", gap: "10px" }}>
          {selectedIds.length > 0 && (
             <button 
               onClick={handleDeleteSelected}
               style={{ padding: '10px 20px', background: '#d32f2f', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
             >
               Delete Selected ({selectedIds.length})
             </button>
          )}
          <button 
            onClick={() => openModalFor("photo")}
            style={{ padding: '10px 20px', background: '#1a237e', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Add Images
          </button>
          <button 
            onClick={() => openModalFor("video")}
            style={{ padding: '10px 20px', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Add Videos
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: "12px", borderRadius: "6px", marginBottom: "20px", background: msg.startsWith("Error") ? "#ffebee" : (msg.includes("Uploading") ? "#fff3e0" : "#e8f5e9"), color: msg.startsWith("Error") ? "#c62828" : (msg.includes("Uploading") ? "#e65100" : "#2e7d32"), fontWeight: msg.includes("Uploading") ? "bold" : "normal" }}>
          {msg}
        </div>
      )}

      {loading ? (
        <p>Loading gallery items...</p>
      ) : items.length === 0 ? (
        <div style={{ padding: '40px', background: 'white', borderRadius: '8px', textAlign: 'center', color: '#888' }}>
          No media found. Click "Add Images" or "Add Videos" above!
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "15px" }}>
            <label style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <input 
                type="checkbox" 
                checked={items.length > 0 && selectedIds.length === items.length}
                onChange={handleSelectAll}
              />
              Select All
            </label>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
            {items.map(item => (
              <div key={item.id} style={{ background: selectedIds.includes(item.id) ? '#e3f2fd' : 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', border: selectedIds.includes(item.id) ? '2px solid #1a237e' : '2px solid transparent', position: "relative" }}>
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  style={{ position: "absolute", top: "10px", left: "10px", zIndex: 10, width: "20px", height: "20px", cursor: "pointer" }}
                />
                {item.type === "video" ? (
                  <video 
                    src={item.cloudinaryUrl} 
                    controls 
                    style={{ width: '100%', height: '150px', objectFit: 'cover', background: '#000' }} 
                  />
                ) : (
                  <img 
                    src={item.cloudinaryUrl} 
                    alt={item.title} 
                    style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
                  />
                )}
                <div style={{ padding: '15px' }}>
                  <h4 style={{ margin: '0 0 5px', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                  <p style={{ margin: '0 0 15px', color: '#888', fontSize: '0.8rem', textTransform: 'capitalize' }}>{item.type} • {item.category}</p>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    style={{ width: '100%', padding: '8px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Media Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "white", borderRadius: "12px", padding: "30px", width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ marginTop: 0, color: "var(--secondary-color)" }}>
              Add Multiple {addType === "photo" ? "Images" : "Videos"}
            </h2>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Select Files from Device *</label>
              <input 
                type="file" 
                multiple
                accept={addType === "photo" ? "image/*" : "video/*"}
                onChange={handleFileChange}
                ref={fileInputRef}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" }}
              />
              {selectedFiles.length > 0 && (
                <p style={{ margin: "5px 0 0", fontSize: "0.8rem", color: "green" }}>
                  {selectedFiles.length} file(s) selected. 
                  ({(selectedFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB total)
                </p>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Title {selectedFiles.length > 1 ? "(Auto-generated from filenames)" : "*"}
              </label>
              <input 
                value={newItem.title} 
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} 
                placeholder={selectedFiles.length > 1 ? "Auto-generated from filenames..." : "e.g. Annual Sports Day 2024"}
                disabled={selectedFiles.length > 1}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", background: selectedFiles.length > 1 ? "#f5f5f5" : "white" }}
              />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Category (applied to all)</label>
              <input 
                value={newItem.category} 
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} 
                placeholder="e.g. Sports, Events, Academics"
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Description (applied to all)</label>
              <textarea 
                value={newItem.description} 
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} 
                rows={3}
                placeholder="Brief description..."
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ddd", boxSizing: "border-box", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ padding: "10px 20px", background: "#f5f5f5", border: "none", borderRadius: "6px", cursor: "pointer", color: "#333", fontWeight: 'bold' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveManual} 
                disabled={saving}
                style={{ padding: "10px 20px", background: "#1a237e", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", opacity: saving ? 0.7 : 1, fontWeight: 'bold' }}
              >
                {saving ? "Saving..." : "Save Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
