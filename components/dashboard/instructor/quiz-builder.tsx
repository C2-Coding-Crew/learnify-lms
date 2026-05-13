"use client";

import React, { useState } from "react";
import { Plus, Trash2, CheckCircle2, Save, Loader2, X, HelpCircle, FileText, Settings2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast-provider";

interface Option {
  id?: number;
  content: string;
  isCorrect: boolean;
}

interface Question {
  id?: number;
  content: string;
  type: string;
  points: number;
  options: Option[];
}

interface QuizBuilderProps {
  courseId: number;
  lessonId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuizBuilder({ courseId, lessonId, onClose, onSuccess }: QuizBuilderProps) {
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState<number>(0);
  const [passingScore, setPassingScore] = useState<number>(70);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      content: "",
      type: "MULTIPLE_CHOICE",
      points: 10,
      options: [
        { content: "", isCorrect: true },
        { content: "", isCorrect: false }
      ]
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.push({ content: "", isCorrect: false });
    setQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    // Ensure at least one is correct
    if (!newQuestions[qIndex].options.some(o => o.isCorrect) && newQuestions[qIndex].options.length > 0) {
      newQuestions[qIndex].options[0].isCorrect = true;
    }
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, field: keyof Option, value: any) => {
    const newQuestions = [...questions];
    if (field === 'isCorrect' && value === true) {
      // Uncheck others for multiple choice
      newQuestions[qIndex].options = newQuestions[qIndex].options.map((o, i) => ({
        ...o,
        isCorrect: i === oIndex
      }));
    } else {
      newQuestions[qIndex].options[oIndex] = { ...newQuestions[qIndex].options[oIndex], [field]: value };
    }
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Validasi Gagal", "Judul kuis harus diisi.");
      return;
    }
    if (questions.length === 0) {
      toast.error("Validasi Gagal", "Kuis harus memiliki minimal 1 pertanyaan.");
      return;
    }
    
    for (const [idx, q] of questions.entries()) {
      if (!q.content.trim()) {
        toast.error("Validasi Gagal", `Konten pertanyaan ke-${idx + 1} tidak boleh kosong.`);
        return;
      }
      if (q.options.length < 2) {
        toast.error("Validasi Gagal", `Pertanyaan ke-${idx + 1} minimal harus memiliki 2 pilihan jawaban.`);
        return;
      }
      if (!q.options.some(o => o.isCorrect)) {
        toast.error("Validasi Gagal", `Pertanyaan ke-${idx + 1} harus memiliki satu jawaban benar.`);
        return;
      }
      if (q.options.some(o => !o.content.trim())) {
        toast.error("Validasi Gagal", `Pilihan jawaban pada pertanyaan ke-${idx + 1} tidak boleh kosong.`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const quizRes = await fetch(`/api/instructor/courses/${courseId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, timeLimit, passingScore, lessonId })
      });
      if (!quizRes.ok) throw new Error("Gagal membuat kuis");
      const quiz = await quizRes.json();

      for (const q of questions) {
        const qRes = await fetch(`/api/instructor/quizzes/${quiz.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(q)
        });
        if (!qRes.ok) throw new Error(`Gagal membuat pertanyaan: ${q.content}`);
      }

      toast.success("Kuis Berhasil Dibuat", `Kuis "${title}" telah ditambahkan ke kelas.`);
      onSuccess();
    } catch (err: any) {
      toast.error("Terjadi Kesalahan", err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[1000px] max-h-[90vh] overflow-hidden flex flex-col rounded-[3rem] shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100">
              <FileText className="w-7 h-7 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                 Konfigurasi Kuis Baru 📝
              </h2>
              <p className="text-slate-400 text-sm font-bold mt-1">Susun pertanyaan dan tentukan kriteria kelulusan.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all bg-white border border-slate-100 shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {/* Quiz Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                   <FileText size={12} className="text-indigo-600" /> Judul Kuis
                </label>
                <input 
                   value={title} 
                   onChange={e => setTitle(e.target.value)} 
                   placeholder="Misal: Ujian Akhir Fundamental React" 
                   className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-slate-700 shadow-inner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi & Instruksi</label>
                <textarea 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-6 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium text-sm resize-none text-slate-600 shadow-inner"
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Berikan petunjuk pengerjaan untuk siswa..."
                />
              </div>
            </div>
            
            <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Settings2 size={18} className="text-indigo-600" />
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-widest">Pengaturan</h4>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Passing Score (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={passingScore} 
                    onChange={e => setPassingScore(parseInt(e.target.value))} 
                    className="w-full h-12 bg-white border border-indigo-100 rounded-xl px-4 font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-indigo-300">%</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Time Limit (Menit)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={timeLimit} 
                    onChange={e => setTimeLimit(parseInt(e.target.value))} 
                    className="w-full h-12 bg-white border border-indigo-100 rounded-xl px-4 font-black text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-indigo-300">Min</span>
                </div>
                <p className="text-[9px] text-indigo-400 font-bold italic text-center">Set 0 untuk tanpa batas waktu.</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-50" />

          {/* Questions List */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-800">Daftar Pertanyaan</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Total {questions.length} pertanyaan ditambahkan.</p>
              </div>
              <Button onClick={addQuestion} className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-2xl h-12 px-6 font-black transition-all flex items-center gap-2 shadow-lg shadow-orange-100">
                <Plus size={18} /> Tambah Pertanyaan
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem]">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <HelpCircle size={32} className="text-slate-200" />
                </div>
                <p className="text-sm font-black text-slate-400">Belum Ada Pertanyaan</p>
                <p className="text-xs font-bold text-slate-300 mt-1">Klik tombol di atas untuk mulai membuat pertanyaan.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 relative shadow-sm hover:shadow-xl hover:shadow-slate-100/50 transition-all group/q">
                    <div className="absolute -left-3 top-8 w-10 h-10 bg-[#FF6B4A] text-white rounded-xl flex items-center justify-center font-black shadow-lg shadow-orange-100">
                      {qIdx + 1}
                    </div>
                    
                    <button 
                      onClick={() => removeQuestion(qIdx)}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/q:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="space-y-8 pl-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Konten Pertanyaan</label>
                        <input 
                          value={q.content} 
                          onChange={e => updateQuestion(qIdx, 'content', e.target.value)}
                          placeholder="Misal: Apa fungsi utama dari useEffect dalam React?"
                          className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 outline-none focus:border-[#FF6B4A] transition-all font-bold text-slate-700 shadow-inner"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                           <CheckCircle size={12} className="text-green-500" /> Pilihan Jawaban (Pilih satu yang benar)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${opt.isCorrect ? 'bg-green-50/50 border-green-500 shadow-md shadow-green-100' : 'bg-slate-50 border-slate-100'}`}>
                              <button 
                                onClick={() => updateOption(qIdx, oIdx, 'isCorrect', true)}
                                className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-green-500 text-white shadow-lg' : 'bg-white border border-slate-200 text-transparent'}`}
                              >
                                <CheckCircle2 size={16} />
                              </button>
                              <input 
                                value={opt.content}
                                onChange={e => updateOption(qIdx, oIdx, 'content', e.target.value)}
                                placeholder={`Pilihan ${oIdx + 1}`}
                                className="bg-transparent border-none outline-none flex-1 font-bold text-sm text-slate-700"
                              />
                              {q.options.length > 2 && (
                                <button onClick={() => removeOption(qIdx, oIdx)} className="text-slate-300 hover:text-red-400 p-1.5 hover:bg-white rounded-lg transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={() => addOption(qIdx)}
                          className="text-xs font-black text-[#FF6B4A] hover:bg-orange-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-all border border-dashed border-orange-200 mt-2"
                        >
                          <Plus size={14} /> Tambah Opsi Jawaban
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-10 border-t border-slate-50 flex justify-end gap-4 bg-slate-50/30">
          <Button variant="ghost" onClick={onClose} className="rounded-2xl h-14 px-8 font-black text-slate-400">Batal & Buang</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[1.5rem] h-14 px-10 font-black shadow-xl shadow-indigo-100 active:scale-95 transition-all"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} className="mr-2" />}
            Selesaikan & Simpan Kuis
          </Button>
        </div>
      </div>
    </div>
  );
}
