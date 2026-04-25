import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import { Video, Calendar, Plus, PlayCircle, Users } from "lucide-react";

export default async function InstructorLivePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const roleId = (session.user as any).roleId;
  if (roleId !== 3) {
    redirect("/dashboard");
  }

  const upcomingSessions = [
    { id: 1, title: "Q&A Session: UI/UX", date: "Tomorrow, 10:00 AM", attendees: 45 },
    { id: 2, title: "Figma Pro Workshop", date: "15 Oct 2024, 14:00", attendees: 120 },
  ];

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
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-black text-slate-800 text-lg">Upcoming Sessions</h3>
          <button className="h-10 px-5 bg-orange-50 text-[#FF6B4A] hover:bg-orange-100 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
            <Plus size={16} /> Schedule Live
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="p-6 border border-slate-100 rounded-3xl hover:shadow-xl hover:shadow-slate-100 transition-all group bg-white">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Video size={24} />
              </div>
              <h4 className="font-black text-slate-800 text-lg mb-2">{session.title}</h4>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mb-6">
                <span className="flex items-center gap-1.5"><Calendar size={14} /> {session.date}</span>
                <span className="flex items-center gap-1.5"><Users size={14} /> {session.attendees}</span>
              </div>
              <button className="w-full h-12 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors">
                Edit Details
              </button>
            </div>
          ))}
          
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer min-h-[220px]">
            <div className="w-12 h-12 bg-white shadow-sm border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <Plus size={20} />
            </div>
            <p className="font-bold text-slate-500">Plan a new session</p>
          </div>
        </div>
      </div>
    </main>
  );
}
