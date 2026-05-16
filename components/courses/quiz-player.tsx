"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, Loader2, Trophy, XCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast-provider";

interface Option {
  id: number;
  content: string;
}

interface Question {
  id: number;
  content: string;
  type: string;
  options: Option[];
}

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  passingScore: number;
  questions: Question[];
}

interface QuizPlayerProps {
  quizId: number;
  onComplete: (result: { score: number; isPassed: boolean }) => void;
  onClose: () => void;
}

export default function QuizPlayer({ quizId, onComplete, onClose }: QuizPlayerProps) {
  const toast = useToast();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    isPassed: boolean;
    correctAnswersCount: number;
    totalQuestions: number;
  } | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`/api/student/quizzes/${quizId}`);
        if (!res.ok) throw new Error("Gagal memuat kuis");
        const data = await res.json();
        setQuiz(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId]);

  const handleSelectOption = (questionId: number, optionId: number) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        questionId: parseInt(qId),
        selectedOptionId: oId
      }));

      const res = await fetch(`/api/student/quizzes/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: formattedAnswers })
      });

      if (!res.ok) throw new Error("Gagal mengirim kuis");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      toast.error("Gagal Mengirim", "Terjadi kesalahan saat mengirim jawaban kuis.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF6B4A]" size={40} />
      </div>
    );
  }

  if (!quiz) return null;

  if (result) {
    return (
      <div className="fixed inset-0 bg-white z-[100] overflow-y-auto flex flex-col items-center p-8 md:p-20">
        <div className="max-w-[600px] w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className={`w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-lg ${result.isPassed ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
             {result.isPassed ? <Trophy size={48} /> : <XCircle size={48} />}
          </div>
          
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">
              {result.isPassed ? "Selamat! Kamu Lulus 🎉" : "Yah, Belum Berhasil 😢"}
            </h2>
            <p className="text-slate-400 font-bold mt-2">
              {result.isPassed ? "Kamu telah menyelesaikan kuis ini dengan baik." : "Jangan menyerah! Pelajari kembali materinya dan coba lagi."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Skor Kamu</p>
                <p className="text-4xl font-black text-slate-800">{result.score}%</p>
             </div>
             <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Benar</p>
                <p className="text-4xl font-black text-slate-800">{result.correctAnswersCount}/{result.totalQuestions}</p>
             </div>
          </div>

          <div className="pt-8">
            <Button 
              onClick={() => {
                onComplete({ score: result.score, isPassed: result.isPassed });
                onClose();
              }}
              className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-[2rem] h-16 px-12 font-black shadow-xl shadow-orange-100 transition-all active:scale-95"
            >
              Lanjutkan Belajar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-[#F8F9FB] z-[100] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-8 h-20 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-orange-50 text-[#FF6B4A] rounded-xl flex items-center justify-center font-black">Q</div>
          <div>
            <h3 className="font-black text-slate-900 text-sm tracking-tight line-clamp-1">{quiz.title}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
          <XCircle size={24} />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-100 shrink-0">
        <div 
          className="h-full bg-[#FF6B4A] transition-all duration-500" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-20 flex justify-center">
        <div className="max-w-[800px] w-full space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-orange-500 font-black text-xs uppercase tracking-widest">
              <AlertCircle size={16} /> Pilih Jawaban Terbaik
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              {currentQuestion.content}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`p-6 rounded-[2rem] border-2 text-left transition-all group flex items-center gap-4 ${
                  answers[currentQuestion.id] === option.id
                    ? "bg-orange-50 border-[#FF6B4A] shadow-md shadow-orange-100"
                    : "bg-white border-slate-100 hover:border-orange-200"
                }`}
              >
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  answers[currentQuestion.id] === option.id
                    ? "bg-[#FF6B4A] border-[#FF6B4A] text-white"
                    : "bg-white border-slate-200 group-hover:border-orange-300"
                }`}>
                  {answers[currentQuestion.id] === option.id && <CheckCircle2 size={14} />}
                </div>
                <span className={`text-[15px] font-bold ${
                  answers[currentQuestion.id] === option.id ? "text-slate-900" : "text-slate-600"
                }`}>
                  {option.content}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-slate-100 p-8 flex justify-center shrink-0">
        <div className="max-w-[800px] w-full flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id] || isSubmitting}
            className="bg-[#FF6B4A] hover:bg-[#e55a3d] text-white rounded-[1.5rem] h-14 px-10 font-black shadow-lg shadow-orange-100 transition-all disabled:opacity-50 group"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              currentQuestionIndex === quiz.questions.length - 1 ? "Selesaikan Kuis" : "Pertanyaan Selanjutnya"
            )}
            {!isSubmitting && <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
