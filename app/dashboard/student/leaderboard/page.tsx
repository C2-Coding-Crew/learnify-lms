import { Trophy, Flame, Crown, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function LeaderboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/auth/login");

  const topStudents = await db.user.findMany({
    where: { 
      roleId: 3,  // 3 = Student
      isDeleted: 0,
      points: { gt: 0 }
    },
    orderBy: { points: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      image: true,
      points: true,
      streak: true,
    }
  });

  const currentUser = topStudents.find(s => s.id === session.user.id);
  const userRank = topStudents.findIndex(s => s.id === session.user.id) + 1;

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1000px] mx-auto w-full font-sans">
      <Link 
        href="/dashboard/student"
        className="flex items-center gap-2 text-slate-400 hover:text-[#FF6B4A] transition-colors mb-8 font-bold text-sm group w-fit"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Kembali ke Dashboard
      </Link>

      <header className="mb-10 text-center">
        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mx-auto mb-4 shadow-sm shadow-indigo-100">
          <Trophy size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Leaderboard 🏆</h1>
        <p className="text-slate-500 text-sm mt-2 font-medium">
          Compete with other students and reach the top!
        </p>
      </header>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden">
        <div className="p-6">
          <div className="space-y-4">
            {topStudents.map((student, index) => {
              const isCurrentUser = student.id === session.user.id;
              const rank = index + 1;

              return (
                <div 
                  key={student.id} 
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                    isCurrentUser 
                      ? "bg-indigo-50 border-2 border-indigo-100 ring-4 ring-indigo-50/50" 
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="w-10 text-center font-black text-slate-400 italic">
                    {rank === 1 ? <Crown className="text-yellow-400 mx-auto" size={24} /> : 
                     rank === 2 ? <Crown className="text-slate-300 mx-auto" size={24} /> :
                     rank === 3 ? <Crown className="text-amber-600 mx-auto" size={24} /> :
                     `#${rank}`}
                  </div>

                  <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shadow-sm shrink-0">
                    <img 
                      src={student.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name || "User")}`} 
                      alt={student.name || "Student"} 
                    />
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {student.name}
                      {isCurrentUser && (
                        <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-black">You</span>
                      )}
                    </h4>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold">
                        <Flame size={12} className="text-orange-500" /> {student.streak} Days
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">{student.points}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Points</p>
                  </div>
                </div>
              );
            })}

            {topStudents.length === 0 && (
              <div className="py-20 text-center text-slate-400 font-medium">
                No students found on the leaderboard yet.
              </div>
            )}
          </div>
        </div>

        {/* Footer info for current user if they are not in top 20 */}
        {!currentUser && (
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 text-center font-black text-slate-400 italic">#?</div>
               <div className="w-12 h-12 bg-slate-200 rounded-xl overflow-hidden opacity-50">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.user.name)}`} alt="Me" />
               </div>
               <div>
                <p className="font-bold text-slate-800 text-sm">{session.user.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">Keep learning to appear on the leaderboard!</p>
               </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
