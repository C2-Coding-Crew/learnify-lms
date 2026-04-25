"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CreateCoursePage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    level: "Beginner",
    price: "",
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id.toString() }));
        }
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let thumbnailUrl = "";

      // 1. Upload thumbnail if exists
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });
        
        if (!uploadRes.ok) throw new Error("Failed to upload thumbnail");
        const uploadJson = await uploadRes.json();
        thumbnailUrl = uploadJson.url;
      }

      // 2. Create course
      const courseRes = await fetch("/api/instructor/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          thumbnail: thumbnailUrl
        }),
      });

      if (!courseRes.ok) {
        const errJson = await courseRes.json();
        throw new Error(errJson.error || "Failed to create course");
      }

      const courseJson = await courseRes.json();
      
      // 3. Redirect to edit page to add lessons
      router.push(`/dashboard/instructor/courses/${courseJson.id}/edit`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1000px] mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/instructor/courses" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#FF6B4A] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Buat Kelas Baru 🚀</h1>
          <p className="text-slate-400 text-sm font-medium">Isi detail awal kelas Anda. Anda bisa menambahkan materi/video nanti.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-8">
        {error && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Judul Kelas</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Contoh: Belajar React dari Nol"
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all font-medium text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Harga (Rp)</label>
              <input 
                type="number" 
                required
                min="0"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="0 jika gratis"
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all font-medium text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Kategori</label>
              <select 
                required
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all font-medium text-sm"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Level Kesulitan</label>
              <select 
                required
                value={formData.level}
                onChange={e => setFormData({...formData, level: e.target.value})}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all font-medium text-sm"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Deskripsi Singkat</label>
            <textarea 
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Jelaskan apa yang akan dipelajari siswa di kelas ini..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-[#FF6B4A] focus:ring-2 focus:ring-orange-50 transition-all font-medium text-sm resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Thumbnail Kelas</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative group">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <div className="absolute inset-0 w-full h-full p-2">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white font-bold">
                    Ubah Gambar
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 bg-orange-50 text-[#FF6B4A] rounded-full flex items-center justify-center mb-4">
                    <Upload size={24} />
                  </div>
                  <p className="text-sm font-bold text-slate-700 mb-1">Klik atau Drag gambar ke sini</p>
                  <p className="text-xs text-slate-400">PNG, JPG atau WEBP (Maks 5MB)</p>
                </>
              )}
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-xl h-12 px-8 font-black shadow-lg shadow-orange-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isLoading ? "Menyimpan..." : "Simpan & Lanjut Isi Silabus"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
