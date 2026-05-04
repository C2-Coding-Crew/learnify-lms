"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Video,
  ShieldCheck,
  Star,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ManagedCourse {
  id: number;
  slug?: string;
  title: string;
  students: number;
  rating: number;
  revenue: string;
  active: boolean;
}

interface MonthlyEarning {
  month: string;
  amount: number;
}

interface RecentReview {
  id: number;
  studentName: string;
  studentImage: string | null;
  courseTitle: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

interface InstructorDashboardProps {
  userName: string;
  userEmail: string;
  userRole: string;
  courses?: ManagedCourse[];
  totalRevenue?: number;
  twoFactorEnabled?: boolean;
  monthlyEarnings?: MonthlyEarning[];
  avgRating?: number;
  recentReviews?: RecentReview[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const SVG_CIRCUMFERENCE = 339.29; // 2π × 54
const RATING_MAX = 5;

// ── Pure helpers ──────────────────────────────────────────────────────────────
/** Normalise monthly amounts to bar heights (2%–95%) */
function toBarHeights(amounts: number[]): number[] {
  const max = Math.max(...amounts, 1);
  return amounts.map((a) => Math.max((a / max) * 95, 2));
}

/** SVG stroke offset for a 0–5 rating (mapped to 0–100%) */
function ratingOffset(rating: number): number {
  return SVG_CIRCUMFERENCE * (1 - rating / RATING_MAX);
}

/** Relative time label (e.g. "2 days ago") */
function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InstructorDashboard({
  userName,
  userEmail,
  userRole,
  courses = [],
  totalRevenue = 0,
  twoFactorEnabled = false,
  monthlyEarnings = [],
  avgRating = 0,
  recentReviews = [],
}: InstructorDashboardProps) {
  const router = useRouter();

  const barHeights = toBarHeights(monthlyEarnings.map((m) => m.amount));
  const hasEarnings = monthlyEarnings.some((m) => m.amount > 0);

  const formatIDR = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      {/* ── Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Instructor Hub: {userName.split(" ")[0]} ✍️
          </h1>
          <p className="text-slate-400 text-sm font-medium">
            {recentReviews.length > 0
              ? `${recentReviews.length} new review${recentReviews.length > 1 ? "s" : ""} on your courses`
              : "Welcome back! Manage your courses below."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800">{userName}</p>
            <p className="text-[10px] text-[#FF6B4A] font-black uppercase tracking-wider">
              {userRole}
            </p>
          </div>
          <div className="w-10 h-10 bg-orange-100 rounded-xl overflow-hidden shadow-sm ring-2 ring-white">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                userName
              )}`}
              alt="Instructor avatar"
            />
          </div>
        </div>
      </header>

      {/* ── 2FA Alert Banner ── */}
      {!twoFactorEnabled && (
        <div className="mb-8 bg-gradient-to-r from-orange-500 to-[#FF6B4A] p-6 rounded-[2rem] text-white shadow-xl shadow-orange-200/40 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
          <div className="flex items-center gap-5 z-10">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight">
                Amankan Akun Kamu! 🛡️
              </h2>
              <p className="text-white/80 text-sm max-w-md mt-0.5 font-medium leading-relaxed">
                Aktifkan Autentikasi Dua Faktor (2FA) sekarang untuk melindungi
                data belajar dan akses akunmu dari peretasan.
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push("/dashboard/settings/security")}
            className="bg-white text-[#FF6B4A] hover:bg-slate-50 font-black px-8 py-6 rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-black/5 shrink-0 z-10"
          >
            Aktifkan Sekarang →
          </Button>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-32 -mt-32 transition-all duration-1000 group-hover:bg-white/20" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-[60px] opacity-50" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Main Column ── */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Earnings Chart */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    Monthly Earnings
                  </h3>
                  <p className="text-[10px] text-slate-300 mt-0.5 font-medium">
                    Last 6 months
                  </p>
                </div>
                {hasEarnings && (
                  <span className="text-[10px] font-black text-green-500 bg-green-50 px-2 py-1 rounded-md">
                    Live
                  </span>
                )}
              </div>

              <div className="flex items-end justify-between h-32 gap-2">
                {barHeights.map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1 h-full"
                  >
                    <div className="w-full h-full flex flex-col justify-end bg-orange-50 rounded-lg overflow-hidden">
                      <div
                        className="w-full bg-[#FF6B4A] rounded-lg transition-all duration-500 hover:bg-[#100E2E]"
                        style={{ height: `${height}%` }}
                        title={
                          monthlyEarnings[i]
                            ? `${monthlyEarnings[i].month}: ${formatIDR(monthlyEarnings[i].amount)}`
                            : ""
                        }
                      />
                    </div>
                    <span className="text-[8px] font-bold text-slate-300 uppercase">
                      {monthlyEarnings[i]?.month ?? ""}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-2xl font-black text-slate-800 tracking-tighter">
                {formatIDR(totalRevenue)}
              </p>
              {!hasEarnings && (
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  No earnings recorded yet
                </p>
              )}
            </div>

            {/* Avg Course Rating */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center">
              <div className="w-full flex justify-between items-start mb-2">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Avg. Course Rating
                </h3>
              </div>

              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg
                  className="w-full h-full transform -rotate-90"
                  aria-hidden="true"
                >
                  <circle
                    cx="64" cy="64" r="54"
                    stroke="currentColor" strokeWidth="10" fill="transparent"
                    className="text-slate-50"
                  />
                  <circle
                    cx="64" cy="64" r="54"
                    stroke="#FF6B4A" strokeWidth="10" fill="transparent"
                    strokeDasharray={SVG_CIRCUMFERENCE}
                    strokeDashoffset={ratingOffset(avgRating)}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-800">
                    {avgRating > 0 ? avgRating.toFixed(2) : "—"}
                  </span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">
                    Stars
                  </span>
                </div>
              </div>

              <p className="text-[11px] font-bold text-[#FF6B4A] mt-4 text-center bg-orange-50 px-3 py-1 rounded-full">
                {courses.length > 0
                  ? `Based on ${courses.length} course${courses.length > 1 ? "s" : ""}`
                  : "No courses yet"}
              </p>
            </div>
          </div>

          {/* ── Managed Courses ── */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-800 px-2 text-sm uppercase tracking-widest">
              Active Courses Performance
            </h3>
            <div className="space-y-3">
              {courses.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-100 text-sm">
                  Belum ada kursus yang dibuat.
                </div>
              ) : (
                courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-5 bg-white rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF6B4A] flex items-center justify-center shrink-0">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-[15px]">
                          {course.title}
                        </p>
                        <p className="text-[11px] text-slate-400 font-bold">
                          {course.students.toLocaleString()} Students Enrolled
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-right shrink-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                        Revenue
                      </p>
                      <p className="text-sm font-black text-[#100E2E]">
                        {course.revenue}
                      </p>
                    </div>

                    <Button
                      onClick={() =>
                        router.push(
                          `/dashboard/instructor/courses/${course.id}/edit`
                        )
                      }
                      variant="outline"
                      className="rounded-xl h-10 px-6 font-black text-xs border-slate-200 text-slate-600 hover:bg-[#FF6B4A] hover:text-white hover:border-[#FF6B4A] transition-all shrink-0"
                    >
                      Manage
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-8">
          {/* Recent Reviews */}
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">
              Recent Reviews
            </h3>

            {recentReviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <MessageSquare size={20} className="text-orange-300" />
                </div>
                <p className="text-slate-400 text-xs font-bold">
                  No reviews yet
                </p>
                <p className="text-slate-300 text-[11px]">
                  Reviews will appear here once students rate your courses
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex items-start gap-3 pb-4 border-b border-slate-50 last:border-none last:pb-0"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-black text-[#FF6B4A] shrink-0 overflow-hidden">
                      {review.studentImage ? (
                        <img
                          src={review.studentImage}
                          alt={review.studentName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        review.studentName.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className="text-[12px] font-black text-slate-700 truncate">
                          {review.studentName}
                        </p>
                        <div className="flex items-center gap-0.5 shrink-0">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              className="text-yellow-400"
                              fill="currentColor"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        {review.courseTitle}
                      </p>
                      {review.comment && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 font-medium">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className="text-[9px] font-black px-2 py-1 bg-orange-50 text-[#FF6B4A] rounded-md shrink-0">
                      {relativeTime(review.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Live Class / Studio Promo */}
          <div className="bg-[#100E2E] p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-slate-200">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#FF6B4A] rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <Video size={20} />
              </div>
              <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">
                Go Live
              </h4>
              <p className="text-lg font-black leading-tight mb-1">
                Start a Live Session
              </p>
              <p className="text-[10px] text-[#FF6B4A] mb-8 font-black uppercase tracking-widest">
                Engage with your students
              </p>
              <Button
                onClick={() => router.push("/dashboard/instructor/live")}
                className="w-full bg-white hover:bg-orange-50 text-[#100E2E] rounded-xl font-black h-12 text-xs transition-all shadow-xl"
              >
                Go to Studio
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B4A]/10 rounded-full blur-[60px] -mr-16 -mt-16" />
          </div>
        </div>
      </div>
    </main>
  );
}
