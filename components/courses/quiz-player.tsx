"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, Loader2, Trophy, XCircle, AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    } catch (err) {
      alert("Terjadi kesalahan saat mengirim jawaban.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-[#FF6B4A]" size={40} /></div>;
  if (!quiz) return <div className="p-20 text-center text-white/50">Kuis tidak ditemukan.</div>;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-[#1A1A2E] rounded-[2.5rem] border border-white/5 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${result.isPassed ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
          {result.isPassed ? <Trophy size={48} /> : <XCircle size={48} />}
        </div>

        <div>
          <h2 className="text-3xl font-black text-white">
            {result.isPassed ? "Selamat! Kamu Lulus! 🎉" : "Yah, Belum Lulus 😢"}
          </h2>
          <p className="text-white/40 font-medium mt-2">
            Skor kamu: <span className={`font-black ${result.isPassed ? 'text-green-500' : 'text-red-500'}`}>{Math.round(result.score)}%</span> (Minimal {quiz.passingScore}%)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-white/5 rounded-3xl">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Benar</p>
            <p className="text-2xl font-black text-white mt-1">{result.correctAnswersCount}</p>
          </div>
          <div className="p-6 bg-white/5 rounded-3xl">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Soal</p>
            <p className="text-2xl font-black text-white mt-1">{result.totalQuestions}</p>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          {!result.isPassed && (
            <Button 
              onClick={() => {
                setResult(null);
                setCurrentQuestionIndex(0);
                setAnswers({});
              }}
              variant="outline"
              className="flex-1 rounded-2xl h-12 font-black border-white/10 hover:bg-white/5"
            >
              Coba Lagi
            </Button>
          )}
          <Button 
            onClick={() => onComplete({ score: result.score, isPassed: result.isPassed })}
            className="flex-1 bg-[#FF6B4A] hover:bg-[#fa5a35] text-white rounded-2xl h-12 font-black shadow-lg shadow-orange-950/20"
          >
            Selesai
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="text-xs font-black text-[#FF6B4A] uppercase tracking-widest">Pertanyaan {currentQuestionIndex + 1} / {quiz.questions.length}</h3>
            <h2 className="text-lg font-bold text-white mt-1 line-clamp-1">{quiz.title}</h2>
          </div>
          <div className="text-[10px] font-bold text-white/30">
            {Math.round(progress)}%
          </div>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#FF6B4A] to-orange-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#1A1A2E] rounded-[2.5rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <HelpCircle size={120} className="text-white" />
        </div>

        <h4 className="text-xl md:text-2xl font-black text-white leading-tight relative z-10">
          {currentQuestion.content}
        </h4>

        <div className="mt-12 space-y-4 relative z-10">
          {currentQuestion.options.map((option) => {
            const isSelected = answers[currentQuestion.id] === option.id;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                className={`w-full p-5 md:p-6 rounded-3xl border-2 text-left transition-all flex items-center justify-between group ${
                  isSelected 
                    ? "bg-[#FF6B4A]/10 border-[#FF6B4A] shadow-lg shadow-orange-950/20" 
                    : "bg-white/5 border-transparent hover:bg-white/10"
                }`}
              >
                <span className={`font-bold text-sm md:text-base ${isSelected ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                  {option.content}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "bg-[#FF6B4A] border-[#FF6B4A]" : "border-white/10"}`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="rounded-2xl h-12 px-6 font-black border-white/10 hover:bg-white/5 text-white/50"
        >
          Keluar
        </Button>
        <Button 
          onClick={handleNext}
          disabled={!answers[currentQuestion.id] || isSubmitting}
          className="bg-white hover:bg-slate-100 text-[#0F0F1A] rounded-2xl h-12 px-10 font-black shadow-xl shadow-black/20 flex items-center gap-2"
        >
          {isSubmitting ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              {currentQuestionIndex === quiz.questions.length - 1 ? "Kirim Jawaban" : "Lanjut"}
              <ChevronRight size={20} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function HelpCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </svg>
  );
}
