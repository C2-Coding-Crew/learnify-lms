"use client";

import React, { useState } from "react";
import { Plus, Trash2, CheckCircle2, Save, Loader2, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    if (!title) return alert("Judul kuis harus diisi");
    if (questions.length === 0) return alert("Kuis harus memiliki minimal 1 pertanyaan");
    
    // Validate each question has at least 2 options and 1 correct answer
    for (const q of questions) {
      if (!q.content) return alert("Konten pertanyaan tidak boleh kosong");
      if (q.options.length < 2) return alert(`Pertanyaan "${q.content}" minimal harus memiliki 2 pilihan`);
      if (!q.options.some(o => o.isCorrect)) return alert(`Pertanyaan "${q.content}" harus memiliki satu jawaban benar`);
      if (q.options.some(o => !o.content)) return alert(`Pilihan jawaban pada pertanyaan "${q.content}" tidak boleh kosong`);
    }

    setIsSaving(true);
    try {
      // 1. Create Quiz
      const quizRes = await fetch(`/api/instructor/courses/${courseId}/quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, timeLimit, passingScore, lessonId })
      });
      if (!quizRes.ok) throw new Error("Failed to create quiz");
      const quiz = await quizRes.json();

      // 2. Create Questions and Options
      for (const q of questions) {
        const qRes = await fetch(`/api/instructor/quizzes/${quiz.id}/questions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(q)
        });
        if (!qRes.ok) throw new Error(`Failed to create question: ${q.content}`);
      }

      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col rounded-[2.5rem] shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
               Buat Kuis Baru 📝
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">Uji pemahaman siswa dengan kuis interaktif.</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Quiz Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Judul Kuis</label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Misal: Kuis Dasar React" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Passing Score (%)</label>
              <Input type="number" value={passingScore} onChange={e => setPassingScore(parseInt(e.target.value))} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-700">Deskripsi (Opsional)</label>
              <textarea 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-[#FF6B4A] transition-all font-medium text-sm resize-none"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Berikan instruksi kuis..."
              />
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Questions List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">Daftar Pertanyaan</h3>
              <Button onClick={addQuestion} className="bg-orange-50 hover:bg-[#FF6B4A] text-[#FF6B4A] hover:text-white rounded-xl h-10 px-4 font-black transition-all flex items-center gap-2">
                <Plus size={16} /> Tambah Pertanyaan
              </Button>
            </div>

            {questions.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
                <HelpCircle size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-400">Belum ada pertanyaan. Klik tombol di atas.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100 relative">
                    <button 
                      onClick={() => removeQuestion(qIdx)}
                      className="absolute top-6 right-6 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-8 h-8 rounded-lg bg-[#FF6B4A] text-white flex items-center justify-center font-black text-sm">
                        {qIdx + 1}
                      </span>
                      <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Pertanyaan</h4>
                    </div>

                    <div className="space-y-6">
                      <Input 
                        value={q.content} 
                        onChange={e => updateQuestion(qIdx, 'content', e.target.value)}
                        placeholder="Tuliskan pertanyaan di sini..."
                        className="bg-white border-none shadow-sm"
                      />

                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilihan Jawaban</label>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-3">
                            <button 
                              onClick={() => updateOption(qIdx, oIdx, 'isCorrect', true)}
                              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all ${opt.isCorrect ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-white border-2 border-slate-200 text-transparent'}`}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                            <Input 
                              value={opt.content}
                              onChange={e => updateOption(qIdx, oIdx, 'content', e.target.value)}
                              placeholder={`Pilihan ${oIdx + 1}`}
                              className="bg-white border-none shadow-sm h-10 text-sm"
                            />
                            {q.options.length > 2 && (
                              <button onClick={() => removeOption(qIdx, oIdx)} className="text-slate-300 hover:text-red-500">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button 
                          onClick={() => addOption(qIdx)}
                          className="text-xs font-bold text-[#FF6B4A] hover:underline flex items-center gap-1 mt-2"
                        >
                          <Plus size={12} /> Tambah Pilihan
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
        <div className="p-8 border-t border-slate-100 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-xl h-11 px-6 font-black">Batal</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-xl h-11 px-8 font-black shadow-lg shadow-orange-100"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Simpan Kuis
          </Button>
        </div>
      </div>
    </div>
  );
}
