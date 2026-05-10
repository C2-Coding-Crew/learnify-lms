import { Video, Play, Clock, Calendar } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function StudentRecordingsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  // Fetch enrolled courses
  const enrollments = await db.enrollment.findMany({
    where: { userId, isDeleted: 0 },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // Fetch recordings for those courses
  const recordingsData = await db.recording.findMany({
    where: { courseId: { in: courseIds }, isDeleted: 0 },
    include: {
      course: { select: { title: true } },
    },
    orderBy: { createdDate: "desc" },
  });

  const recordings = recordingsData.map((r) => ({
    id: r.id,
    title: r.title,
    course: r.course.title,
    duration: r.duration || "N/A",
    date: r.createdDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    thumbnail: null,
  }));

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Recordings 🎬</h1>
          <p className="text-slate-400 text-sm mt-1">Watch back your live session recordings anytime.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recordings.map((rec) => (
            <div key={rec.id} className="bg-white border border-slate-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              {/* Thumbnail */}
              <div className="relative h-44 bg-gradient-to-br from-[#100E2E] to-indigo-800 flex items-center justify-center">
                <button className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-all group-hover:scale-110">
                  <Play size={22} fill="white" className="text-white ml-1" />
                </button>
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                  <Clock size={10} /> {rec.duration}
                </div>
              </div>

              <div className="p-5">
                <span className="text-[10px] font-black text-[#FF6B4A] bg-orange-50 px-2 py-1 rounded-md uppercase tracking-wider">
                  {rec.course}
                </span>
                <h4 className="font-bold text-slate-800 text-sm mt-3 leading-snug line-clamp-2">{rec.title}</h4>
                <div className="flex items-center gap-1 mt-3 text-[11px] text-slate-400 font-medium">
                  <Calendar size={12} /> {rec.date}
                </div>
                <button className="mt-4 w-full h-10 bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-[#FF6B4A] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2">
                  <Play size={14} /> Watch Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {recordings.length === 0 && (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Video size={36} />
            </div>
            <h3 className="font-black text-slate-700">Belum ada recording</h3>
            <p className="text-sm text-slate-400 mt-2">Recordings dari live session kamu akan muncul di sini.</p>
          </div>
        )}
    </main>
  );
}
