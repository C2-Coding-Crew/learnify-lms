import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import { Video, Calendar, Plus, PlayCircle, Users } from "lucide-react";
import { db } from "@/lib/db";
import LiveCRUD from "@/components/dashboard/instructor/live/live-crud";

export default async function InstructorLivePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 2) {
    redirect("/dashboard");
  }

  const instructorId = session.user.id;
  
  // 1. Fetch upcoming sessions from real Schedule table
  const upcomingSessions = await db.schedule.findMany({
    where: {
      course: { instructorId, isDeleted: 0 },
      endTime: { gte: new Date() },
      isDeleted: 0
    },
    include: {
      course: { select: { title: true } }
    },
    orderBy: { startTime: "asc" },
    take: 10
  });

  const formattedSessions = upcomingSessions.map((s: any) => ({
    id: s.id,
    title: s.title,
    courseTitle: s.course.title,
    date: s.startTime.toLocaleDateString("id-ID", { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    rawStartTime: s.startTime.toISOString(),
    rawEndTime: s.endTime.toISOString(),
    location: s.location,
    attendees: 0 // In future, connect to real live attendee tracking
  }));

  const instructorCourses = await db.course.findMany({
    where: { instructorId, isDeleted: 0 },
    select: { id: true, title: true }
  });

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Live Sessions 🎙️" 
        subtitle="Host live classes and interact with your students."
      />

      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] p-10 text-white mb-8 relative overflow-hidden group shadow-xl shadow-purple-200/50">
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Streaming Built-in</span>
          </div>
          <h2 className="text-4xl font-black mb-4 leading-tight">Engage your students in real-time.</h2>
          <p className="text-white/80 font-medium mb-8">Schedule live Q&A sessions, host webinars, or teach live directly from your Learnify dashboard. No external tools needed.</p>
          <button className="h-14 px-8 bg-white text-purple-600 hover:bg-slate-50 rounded-2xl font-black shadow-lg shadow-black/10 transition-transform active:scale-95 flex items-center gap-3">
            <PlayCircle size={20} /> Start Instant Stream
          </button>
        </div>
        
        {/* Dekorasi */}
        <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -mr-40 -mt-20 group-hover:bg-white/20 transition-all duration-1000" />
        <div className="absolute right-20 bottom-10 opacity-20">
          <Video size={200} />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-8">
        <LiveCRUD initialSessions={formattedSessions} instructorCourses={instructorCourses} />
      </div>
    </main>
  );
}
