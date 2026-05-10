"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Video, Plus, Trash2, GripVertical, CheckCircle2, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizBuilder } from "@/components/dashboard/instructor/quiz-builder";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  // Quiz Builder State
  const [isAddingQuiz, setIsAddingQuiz] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

  // Add Lesson State
  const [isAddingLesson, setIsAddingLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({ title: "", description: "", videoUrl: "", duration: "", isFree: false });

  useEffect(() => {
    Promise.all([
      fetch(`/api/instructor/courses/${courseId}`).then(res => res.json()),
      fetch(`/api/instructor/courses/${courseId}/quizzes`).then(res => res.json()),
      fetch("/api/categories").then(res => res.json())
    ]).then(([courseData, quizData, catData]) => {
      if (courseData.error) {
        setError(courseData.error);
      } else {
        setCourse(courseData);
        setLessons(courseData.lessons || []);
        setQuizzes(quizData || []);
      }
      setCategories(catData);
      setIsLoading(false);
    }).catch(err => {
      setError("Failed to load course data");
      setIsLoading(false);
    });
  }, [courseId]);

  const refreshQuizzes = async () => {
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/quizzes`);
      const data = await res.json();
      setQuizzes(data);
    } catch (err) {
      console.error("Failed to refresh quizzes", err);
    }
  };

  const handleUpdateCourse = async (e?: React.FormEvent, submitForReview = false) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: course.title,
          description: course.description,
          categoryId: course.categoryId,
          price: course.price,
          level: course.level,
          isPublished: course.isPublished,
          status: submitForReview ? 2 : course.status
        })
      });
      if (!res.ok) throw new Error("Failed to update course");
      
      const updatedData = await res.json();
      setCourse(updatedData);
      
      if (submitForReview) {
        alert("Kursus telah diajukan ke admin untuk direview!");
      } else {
        alert("Perubahan berhasil disimpan!");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLesson)
      });
      if (!res.ok) throw new Error("Failed to add lesson");
      const addedLesson = await res.json();
      setLessons([...lessons, addedLesson]);
      setIsAddingLesson(false);
      setNewLesson({ title: "", description: "", videoUrl: "", duration: "", isFree: false });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm("Hapus materi ini?")) return;
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}/lessons/${lessonId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Failed to delete lesson");
      setLessons(lessons.filter(l => l.id !== lessonId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-[#FF6B4A]" size={40} /></div>;
  if (error) return <div className="p-10 text-red-500">{error}</div>;

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1200px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/instructor/courses" className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-[#FF6B4A] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Kelas ✏️</h1>
            <p className="text-slate-400 text-sm font-medium">Kelola informasi kelas dan silabus materi.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status Badge */}
          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${
            course.isPublished 
              ? 'bg-green-50 text-green-600 border-green-100' 
              : course.status === 2 
                ? 'bg-orange-50 text-orange-600 border-orange-100 animate-pulse'
                : 'bg-slate-50 text-slate-400 border-slate-100'
          }`}>
            {course.isPublished ? "Status: Published" : course.status === 2 ? "Status: Pending Review" : "Status: Draft"}
          </div>

          {/* Instructor Action: Submit for Review */}
          {!course.isPublished && course.status !== 2 && (
            <Button 
              onClick={() => handleUpdateCourse(undefined, true)}
              disabled={isSaving}
              variant="outline"
              className="rounded-xl h-11 font-black px-6 border-2 border-orange-500 text-orange-600 hover:bg-orange-50 transition-all"
            >
              Submit for Review 🚀
            </Button>
          )}

          <Button 
            onClick={() => handleUpdateCourse()}
            disabled={isSaving}
            className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-xl h-11 px-6 font-black shadow-lg shadow-orange-100 transition-all flex items-center gap-2"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Simpan Perubahan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Kolom Kiri: Form Informasi Kelas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-6">
            <h3 className="text-lg font-black text-slate-800 mb-6">Informasi Dasar</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Judul Kelas</label>
                <input 
                  type="text" 
                  value={course.title}
                  onChange={e => setCourse({...course, title: e.target.value})}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Harga (Rp)</label>
                <input 
                  type="number" 
                  value={course.price}
                  onChange={e => setCourse({...course, price: e.target.value})}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Kategori</label>
                <select 
                  value={course.categoryId}
                  onChange={e => setCourse({...course, categoryId: e.target.value})}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] transition-all font-medium text-sm"
                >
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Level</label>
                <select 
                  value={course.level}
                  onChange={e => setCourse({...course, level: e.target.value})}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 outline-none focus:border-[#FF6B4A] transition-all font-medium text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="All Levels">All Levels</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Deskripsi</label>
                <textarea 
                  rows={4}
                  value={course.description}
                  onChange={e => setCourse({...course, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none focus:border-[#FF6B4A] transition-all font-medium text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Silabus Materi */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">Silabus Materi</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Total {lessons.length} video materi</p>
              </div>
              {!isAddingLesson && (
                <Button 
                  onClick={() => setIsAddingLesson(true)}
                  className="bg-orange-50 hover:bg-[#FF6B4A] text-[#FF6B4A] hover:text-white rounded-xl h-10 px-4 font-black transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Materi
                </Button>
              )}
            </div>

            {/* Form Tambah Materi */}
            {isAddingLesson && (
              <form onSubmit={handleAddLesson} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Judul Materi</label>
                  <input type="text" required value={newLesson.title} onChange={e => setNewLesson({...newLesson, title: e.target.value})} className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm focus:border-[#FF6B4A] outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">URL Video (YouTube)</label>
                    <input type="text" value={newLesson.videoUrl} onChange={e => setNewLesson({...newLesson, videoUrl: e.target.value})} placeholder="https://youtube.com/..." className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm focus:border-[#FF6B4A] outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700">Durasi (Menit)</label>
                    <input type="number" required value={newLesson.duration} onChange={e => setNewLesson({...newLesson, duration: e.target.value})} placeholder="Misal: 15" className="w-full h-10 bg-white border border-slate-200 rounded-lg px-3 text-sm focus:border-[#FF6B4A] outline-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isFree" checked={newLesson.isFree} onChange={e => setNewLesson({...newLesson, isFree: e.target.checked})} className="w-4 h-4 rounded text-[#FF6B4A] focus:ring-[#FF6B4A]" />
                  <label htmlFor="isFree" className="text-xs font-bold text-slate-600">Video Gratis (Preview)</label>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" onClick={() => setIsAddingLesson(false)} variant="outline" className="h-9 rounded-lg text-xs font-bold">Batal</Button>
                  <Button type="submit" disabled={isSaving} className="h-9 bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-lg text-xs font-bold">{isSaving ? 'Menyimpan...' : 'Simpan Materi'}</Button>
                </div>
              </form>
            )}

            {/* List Materi */}
            <div className="space-y-3">
              {lessons.length === 0 && !isAddingLesson && (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <Video size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-400">Belum ada materi pelajaran.</p>
                </div>
              )}
              {lessons.map((lesson, idx) => (
                <div key={lesson.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-shadow group">
                  <div className="cursor-grab text-slate-300 hover:text-slate-500">
                    <GripVertical size={20} />
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B4A] flex items-center justify-center font-black">
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                       {lesson.title}
                       {lesson.isFree && <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">Preview</span>}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Durasi: {lesson.duration} Menit</p>
                  </div>
                  <button onClick={() => handleDeleteLesson(lesson.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Section Kuis */}
            <div className="mt-12 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-800">Kuis Pelajaran 📝</h3>
                  <p className="text-xs font-bold text-slate-400 mt-1">Uji pemahaman siswa setelah materi selesai.</p>
                </div>
                <Button 
                  onClick={() => {
                    setSelectedLessonId(null);
                    setIsAddingQuiz(true);
                  }}
                  className="bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl h-10 px-4 font-black transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah Kuis Umum
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quizzes.length === 0 && (
                  <div className="md:col-span-2 text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                    <FileQuestion size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-bold text-slate-400">Belum ada kuis untuk kelas ini.</p>
                  </div>
                )}
                {quizzes.map((quiz: any) => (
                  <div key={quiz.id} className="p-5 bg-white border border-slate-100 rounded-3xl hover:shadow-lg transition-all flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">
                      Q
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm">{quiz.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                        {quiz._count.questions} Pertanyaan • Lulus {quiz.passingScore}%
                      </p>
                    </div>
                    <button className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Builder Modal */}
      {isAddingQuiz && (
        <QuizBuilder 
          courseId={parseInt(courseId)}
          lessonId={selectedLessonId}
          onClose={() => setIsAddingQuiz(false)}
          onSuccess={() => {
            setIsAddingQuiz(false);
            refreshQuizzes();
          }}
        />
      )}
    </main>
  );
}
