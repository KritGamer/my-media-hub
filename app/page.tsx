"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Plus, Search, Film, Image as ImageIcon, ExternalLink, Tag } from "lucide-react";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface MediaItem {
  id: number;
  title: string;
  url: string;
  domain: string;
  thumbnail_url: string;
  media_type: "video" | "image";
  tags: string[];
}

export default function Home() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "video" | "image">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for Manual Entry
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDomain, setNewDomain] = useState("");
  const [newType, setNewType] = useState<"video" | "image">("video");
  const [newThumb, setNewThumb] = useState("");
  const [newTags, setNewTags] = useState("");

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data);
    }
  }

  async function handleAddMedia(e: React.FormEvent) {
    e.preventDefault();
    const tagArray = newTags.split(",").map((t) => t.trim()).filter(Boolean);

    const newItem = {
      title: newTitle,
      url: newUrl,
      domain: newDomain || "Custom",
      thumbnail_url: newThumb,
      media_type: newType,
      tags: tagArray,
    };

    const { error } = await supabase.from("media").insert([newItem]);

    if (!error) {
      setIsModalOpen(false);
      setNewTitle("");
      setNewUrl("");
      setNewDomain("");
      setNewThumb("");
      setNewTags("");
      fetchMedia();
    } else {
      alert("Error adding item: " + error.message);
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesType = filterType === "all" || item.media_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Private Media Hub</h1>
          <p className="text-slate-400 text-sm">Personal Vault for Videos & Picture Collections</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={18} /> Add New Link
        </button>
      </header>

      {/* Controls: Search & Tabs */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search titles or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filterType === "all" ? "bg-slate-800 text-white" : "text-slate-400"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("video")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition ${filterType === "video" ? "bg-slate-800 text-white" : "text-slate-400"}`}
          >
            <Film size={14} /> Videos
          </button>
          <button
            onClick={() => setFilterType("image")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md text-sm font-medium transition ${filterType === "image" ? "bg-slate-800 text-white" : "text-slate-400"}`}
          >
            <ImageIcon size={14} /> Pictures
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col">
            <div className="relative aspect-video bg-slate-950 overflow-hidden">
              {item.thumbnail_url ? (
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  {item.media_type === "video" ? <Film size={32} /> : <ImageIcon size={32} />}
                </div>
              )}
              <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md px-2 py-0.5 rounded text-xs font-semibold text-slate-300">
                {item.domain}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-slate-100 text-sm line-clamp-2 mb-2">{item.title}</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.tags?.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px]">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-medium py-2 rounded-lg transition"
              >
                Open {item.media_type === "video" ? "Video" : "Gallery"} <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </main>

      {/* Manual Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Manual Item</h2>
            <form onSubmit={handleAddMedia} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">URL</label>
                <input
                  type="url"
                  required
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as "video" | "image")}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm text-slate-200"
                  >
                    <option value="video">Video</option>
                    <option value="image">Picture</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Domain Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Imgur"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={newThumb}
                  onChange={(e) => setNewThumb(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  placeholder="Amateur, Favorite, 4K"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 py-2 rounded text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 py-2 rounded text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
