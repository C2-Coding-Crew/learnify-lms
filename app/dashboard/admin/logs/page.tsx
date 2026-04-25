import { Activity, AlertTriangle, Info, CheckCircle, Search } from "lucide-react";

export default async function AdminLogsPage() {
  const logs = [
    { id: 1, level: "info",    message: "User budi@example.com logged in successfully",              user: "budi@example.com",  time: "10:30:42 AM", date: "25 Apr 2024" },
    { id: 2, level: "info",    message: "New enrollment: UI/UX Fundamentals by siti@example.com",    user: "siti@example.com",  time: "10:12:05 AM", date: "25 Apr 2024" },
    { id: 3, level: "warning", message: "Failed login attempt for unknown@example.com (3rd attempt)", user: "unknown",           time: "09:58:11 AM", date: "25 Apr 2024" },
    { id: 4, level: "info",    message: "Course 'Figma Pro' published by sarah@learnify.id",         user: "sarah@learnify.id", time: "09:45:00 AM", date: "25 Apr 2024" },
    { id: 5, level: "error",   message: "Payment gateway timeout for invoice INV-20240425-XY12",      user: "system",            time: "09:32:18 AM", date: "25 Apr 2024" },
    { id: 6, level: "info",    message: "Admin panel access by admin@learnify.id",                   user: "admin@learnify.id", time: "09:01:00 AM", date: "25 Apr 2024" },
    { id: 7, level: "info",    message: "Certificate generated for user andi@example.com",           user: "andi@example.com",  time: "08:55:33 AM", date: "25 Apr 2024" },
  ];

  const levelStyle: Record<string, { bg: string; text: string; badge: string; icon: React.ReactNode }> = {
    info:    { bg: "hover:bg-blue-50/30",   text: "text-blue-600",  badge: "bg-blue-50 text-blue-600",   icon: <Info size={16} /> },
    warning: { bg: "hover:bg-yellow-50/30", text: "text-yellow-600",badge: "bg-yellow-50 text-yellow-600",icon: <AlertTriangle size={16} /> },
    error:   { bg: "hover:bg-red-50/30",    text: "text-red-600",   badge: "bg-red-50 text-red-600",     icon: <AlertTriangle size={16} /> },
    success: { bg: "hover:bg-green-50/30",  text: "text-green-600", badge: "bg-green-50 text-green-600", icon: <CheckCircle size={16} /> },
  };

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-[#2D2D2D] tracking-tight">System Logs 🗃️</h1>
            <p className="text-slate-400 text-sm font-bold mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live system activity
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Logs",  value: "24,891", icon: Activity,      color: "text-slate-600",   bg: "bg-slate-50" },
            { label: "Info",        value: "21,440", icon: Info,           color: "text-blue-600",    bg: "bg-blue-50" },
            { label: "Warnings",    value: "3,201",  icon: AlertTriangle,  color: "text-yellow-600",  bg: "bg-yellow-50" },
            { label: "Errors",      value: "250",    icon: AlertTriangle,  color: "text-red-600",     bg: "bg-red-50" },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-orange-50 shadow-sm flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}><s.icon size={20} /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                <h4 className="text-xl font-black text-[#2D2D2D]">{s.value}</h4>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-orange-50 p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h3 className="font-black text-[#2D2D2D] text-lg">Recent Activity</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search logs..." className="pl-11 pr-4 h-11 bg-orange-50/40 rounded-xl border-none text-sm outline-none focus:ring-2 focus:ring-orange-200 w-56 font-medium transition-all" />
            </div>
          </div>

          <div className="font-mono text-sm space-y-2">
            {logs.map((log) => {
              const style = levelStyle[log.level] ?? levelStyle.info;
              return (
                <div key={log.id} className={`flex items-start gap-4 px-5 py-4 rounded-2xl transition-colors ${style.bg} border border-transparent hover:border-slate-100`}>
                  <div className={`mt-0.5 flex-shrink-0 ${style.text}`}>{style.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-800 text-xs font-bold leading-relaxed">{log.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{log.user} · {log.date} {log.time}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md flex-shrink-0 ${style.badge}`}>{log.level}</span>
                </div>
              );
            })}
          </div>
        </div>
    </main>
  );
}
