"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    image: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/user/profile")
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          image: data.image || "",
        });
        setPreview(data.image || null);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setIsLoading(false);
      });
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
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      let imageUrl = formData.image;

      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
        if (!uploadRes.ok) throw new Error("Upload gagal");
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
      }

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, image: imageUrl }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui profil");
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#FF6B4A]" size={40} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B4A] transition-colors mb-6 font-bold text-sm group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan Profil</h1>
          <p className="text-slate-500 text-sm mt-1">
            Kelola informasi publik Anda.
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
          {error && <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100">{error}</div>}
          {success && <div className="mb-6 bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold border border-green-100">Profil berhasil diperbarui!</div>}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-[2.5rem] bg-orange-100 overflow-hidden ring-4 ring-white shadow-lg">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#FF6B4A]">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 w-10 h-10 bg-[#FF6B4A] text-white rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#e55a3d] transition-all shadow-lg hover:scale-110">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Foto Profil</p>
            </div>

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 bg-slate-50 border border-slate-100 rounded-2xl px-4 outline-none focus:ring-2 focus:ring-orange-100 transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2 opacity-60">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email (Tidak dapat diubah)</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full h-12 bg-slate-100 border border-slate-200 rounded-2xl px-4 cursor-not-allowed font-bold text-slate-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSaving}
                className="w-full bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-[1.5rem] h-14 font-black shadow-lg shadow-orange-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
