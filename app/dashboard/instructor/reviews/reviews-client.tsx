"use client";

import React, { useState } from "react";
import { Star, MessageSquare, Reply, Send, Loader2, Search, Filter } from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  reply: string | null;
  createdDate: string;
  user: {
    name: string;
    image: string | null;
    email: string;
  };
  course: {
    title: string;
    id: number;
  };
}

interface ReviewsClientProps {
  initialReviews: Review[];
}

export default function ReviewsClient({ initialReviews }: ReviewsClientProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const filteredReviews = reviews.filter(r => 
    r.course.title.toLowerCase().includes(search.toLowerCase()) ||
    r.user.name.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  const handleReply = async (reviewId: number) => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/instructor/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyContent })
      });

      const data = await res.json();

      if (!data.error) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: replyContent } : r));
        setReplyingTo(null);
        setReplyContent("");
        toast.success("Berhasil", "Balasan Anda telah dikirim.");
      } else {
        toast.error("Gagal", data.error);
      }
    } catch (err) {
      toast.error("Gagal", "Terjadi kesalahan saat mengirim balasan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student, course, or comment..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 h-12 bg-slate-50 rounded-2xl border-none text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all font-medium"
          />
        </div>
        <button className="h-12 px-6 bg-slate-50 text-slate-600 rounded-2xl flex items-center gap-2 font-bold text-sm hover:bg-slate-100 transition-colors w-full md:w-auto justify-center">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-6">
        {filteredReviews.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center gap-4">
             <Star size={64} className="text-slate-200" />
             <p className="text-slate-400 font-bold">No reviews found.</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm overflow-hidden flex flex-col md:flex-row">
              {/* Left Side: Student Info */}
              <div className="p-8 md:w-80 border-b md:border-b-0 md:border-r border-slate-50 bg-slate-50/30 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-orange-100 text-[#FF6B4A] rounded-[2rem] flex items-center justify-center font-black text-2xl mb-4 shadow-lg shadow-orange-100">
                  {review.user.image ? (
                    <img src={review.user.image} alt={review.user.name} className="w-full h-full object-cover rounded-[2rem]" />
                  ) : (
                    review.user.name.charAt(0)
                  )}
                </div>
                <h4 className="font-black text-slate-800">{review.user.name}</h4>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{review.user.email}</p>
                <div className="flex items-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200"} />
                  ))}
                </div>
              </div>

              {/* Right Side: Comment & Reply */}
              <div className="flex-1 p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <span className="text-[10px] font-black text-[#FF6B4A] uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full">
                      {review.course.title}
                    </span>
                    <p className="text-[10px] text-slate-300 font-bold mt-2">
                      {new Date(review.createdDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-slate-50 p-6 rounded-3xl relative">
                    <MessageSquare className="absolute -top-3 -left-3 text-orange-200 bg-white rounded-full p-1 shadow-sm" size={24} />
                    <p className="text-slate-600 text-sm italic leading-relaxed">
                      "{review.comment || "No comment provided."}"
                    </p>
                  </div>

                  {/* Reply Section */}
                  {review.reply ? (
                    <div className="mt-6 ml-8 bg-orange-50/50 p-6 rounded-3xl border border-orange-100/50 relative">
                      <Reply className="absolute -top-3 -left-3 text-[#FF6B4A] bg-white rounded-full p-1 shadow-sm" size={24} />
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[10px] font-black text-[#FF6B4A] uppercase tracking-widest">Your Reply</p>
                      </div>
                      <p className="text-slate-700 text-sm font-medium">
                        {review.reply}
                      </p>
                    </div>
                  ) : replyingTo === review.id ? (
                    <div className="mt-6 ml-8">
                      <textarea 
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply here..."
                        className="w-full p-4 bg-white rounded-2xl border-2 border-orange-100 outline-none focus:border-[#FF6B4A] transition-all text-sm font-medium h-32 resize-none"
                      />
                      <div className="flex justify-end gap-3 mt-3">
                        <button 
                          onClick={() => setReplyingTo(null)}
                          className="px-6 h-10 rounded-xl text-slate-400 font-bold text-sm hover:bg-slate-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleReply(review.id)}
                          disabled={isSubmitting || !replyContent.trim()}
                          className="px-6 h-10 bg-[#FF6B4A] text-white rounded-xl font-bold text-sm hover:bg-[#e55a3d] transition-all shadow-lg shadow-orange-100 flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          Send Reply
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setReplyingTo(review.id)}
                      className="mt-6 ml-8 flex items-center gap-2 text-[#FF6B4A] font-bold text-sm hover:gap-3 transition-all"
                    >
                      <Reply size={18} />
                      Reply to this review
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
