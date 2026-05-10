import { Calendar, Clock, BookOpen, ChevronRight } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function StudentSchedulePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const userId = session.user.id;

  // Fetch enrolled courses
  const enrollments = await db.enrollment.findMany({
    where: { userId, isDeleted: 0 },
    select: { courseId: true },
  });

  const courseIds = enrollments.map((e) => e.courseId);

  // Fetch schedules
  const schedulesData = await db.schedule.findMany({
    where: { courseId: { in: courseIds }, isDeleted: 0 },
    include: { course: { select: { title: true } } },
    orderBy: { startTime: "asc" },
  });

  // Also fetch assignments as "Deadlines" for the schedule
  const assignmentsData = await db.assignment.findMany({
    where: { courseId: { in: courseIds }, isDeleted: 0 },
    include: { course: { select: { title: true } } },
    orderBy: { dueDate: "asc" },
  });

  // Group by date
  const groupedSchedule: Record<string, any> = {};

  schedulesData.forEach((s) => {
    const dateStr = s.startTime.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    if (!groupedSchedule[dateStr]) groupedSchedule[dateStr] = { day: s.startTime.toLocaleDateString("en-GB", { weekday: "long" }), date: dateStr, events: [] };
    groupedSchedule[dateStr].events.push({
      time: s.startTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
      title: s.title,
      type: "Live Class",
      course: s.course.title,
    });
  });

  assignmentsData.forEach((a) => {
    const dateStr = a.dueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    if (!groupedSchedule[dateStr]) groupedSchedule[dateStr] = { day: a.dueDate.toLocaleDateString("en-GB", { weekday: "long" }), date: dateStr, events: [] };
    groupedSchedule[dateStr].events.push({
      time: "11:59 PM",
      title: `Deadline: ${a.title}`,
      type: "Deadline",
      course: a.course.title,
    });
  });

  const scheduleList = Object.values(groupedSchedule).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const totalEvents = scheduleList.reduce((sum, day) => sum + day.events.length, 0);
  const liveSessions = schedulesData.length;
  const activeCourses = courseIds.length;

  const typeColors: Record<string, string> = {
    "Live Class": "bg-indigo-50 text-indigo-600 border-indigo-100",
    "Self Study": "bg-orange-50 text-orange-600 border-orange-100",
    "Live Q&A":   "bg-green-50 text-green-600 border-green-100",
    "Deadline":   "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-slate-900">Schedule 📅</h1>
          <p className="text-slate-400 text-sm mt-1">Stay on track with your weekly learning plan.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "This Week", value: `${totalEvents} Events`, icon: Calendar },
            { label: "Live Sessions", value: `${liveSessions}`, icon: Clock },
            { label: "Courses Enrolled", value: `${activeCourses}`, icon: BookOpen },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF6B4A] flex items-center justify-center">
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-2xl font-black text-slate-800">{s.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {scheduleList.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-20 text-center border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Calendar size={36} />
              </div>
              <h3 className="font-black text-slate-700">Belum ada jadwal</h3>
              <p className="text-sm text-slate-400 mt-2">Jadwal live class dan deadline tugas Anda akan muncul di sini.</p>
            </div>
          ) : (
            scheduleList.map((day, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] shadow-sm border border-slate-50 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg">{day.day}</h3>
                    <p className="text-sm text-slate-400 font-medium">{day.date}</p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                    {day.events.length} Event{day.events.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-3">
                  {day.events.map((event: any, eIdx: number) => (
                    <div key={eIdx} className={`flex items-center gap-5 p-4 rounded-2xl border ${typeColors[event.type] || "bg-slate-50 border-slate-100"}`}>
                      <div className="text-center min-w-[64px]">
                        <p className="text-[10px] font-black uppercase tracking-wider opacity-60">Time</p>
                        <p className="font-black text-sm">{event.time}</p>
                      </div>
                      <div className="w-px h-10 bg-current opacity-20" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{event.title}</p>
                        <p className="text-[11px] opacity-60 mt-0.5 font-medium">{event.course}</p>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider opacity-70 bg-white/60 px-2 py-1 rounded-lg">
                        {event.type}
                      </span>
                      <ChevronRight size={16} className="opacity-40" />
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
    </main>
  );
}
