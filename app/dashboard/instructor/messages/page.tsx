import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import { Search, Send, MoreVertical, Paperclip, Smile } from "lucide-react";

export default async function InstructorMessagesPage() {
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

  const contacts = [
    { id: 1, name: "Budi Santoso", message: "Terima kasih pak atas feedbacknya...", time: "10:30", unread: 2 },
    { id: 2, name: "Siti Aminah", message: "Bagaimana cara instalasi plugin ini?", time: "09:15", unread: 0 },
    { id: 3, name: "Rina Kusuma", message: "Tugas sudah saya upload.", time: "Yesterday", unread: 0 },
  ];

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full h-full flex flex-col min-h-screen">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Messages 💬" 
        subtitle="Chat with your students."
      />

      <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-50 flex overflow-hidden min-h-[600px]">
        {/* Left Sidebar: Contacts */}
        <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30">
          <div className="p-6 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-11 pr-4 h-11 bg-white rounded-xl border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all font-medium shadow-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact, idx) => (
              <div key={contact.id} className={`p-4 border-b border-slate-100 flex gap-4 cursor-pointer hover:bg-white transition-colors ${idx === 0 ? 'bg-white border-l-4 border-l-[#FF6B4A]' : 'border-l-4 border-l-transparent'}`}>
                <div className="w-12 h-12 bg-orange-100 text-[#FF6B4A] rounded-full flex items-center justify-center font-black shrink-0">
                  {contact.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{contact.name}</h4>
                    <span className="text-[10px] font-bold text-slate-400">{contact.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{contact.message}</p>
                </div>
                {contact.unread > 0 && (
                  <div className="w-5 h-5 bg-[#FF6B4A] rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 mt-1">
                    {contact.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Content: Active Chat */}
        <div className="flex-1 flex flex-col bg-white relative">
          {/* Chat Header */}
          <div className="h-20 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-orange-100 text-[#FF6B4A] rounded-full flex items-center justify-center font-black">
                B
              </div>
              <div>
                <h3 className="font-black text-slate-800">Budi Santoso</h3>
                <p className="text-[10px] font-bold text-green-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
                </p>
              </div>
            </div>
            <button className="text-slate-300 hover:text-slate-600 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-8 overflow-y-auto flex flex-col gap-6 bg-[#F8F9FB]">
            <div className="text-center">
              <span className="bg-slate-200/50 text-slate-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
            </div>
            
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-8 h-8 bg-orange-100 text-[#FF6B4A] rounded-full flex items-center justify-center font-black shrink-0 text-xs">
                B
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-sm shadow-sm border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">Halo Pak, saya kesulitan mengerti bagian flexbox di CSS. Apakah ada referensi tambahan?</p>
                <span className="text-[10px] font-bold text-slate-300 mt-2 block">10:28 AM</span>
              </div>
            </div>

            <div className="flex gap-4 max-w-[80%] self-end flex-row-reverse">
              <div className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center font-black shrink-0 text-xs">
                You
              </div>
              <div className="bg-[#FF6B4A] p-4 rounded-2xl rounded-tr-sm shadow-md shadow-orange-100 text-white">
                <p className="text-sm font-medium leading-relaxed">Halo Budi! Tentu, coba baca artikel dari CSS-Tricks tentang Flexbox, sangat lengkap dan ada gambarnya.</p>
                <span className="text-[10px] font-bold text-white/70 mt-2 block text-right">10:30 AM</span>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="flex items-center gap-3 bg-[#F8F9FB] p-2 rounded-2xl border border-slate-100">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Paperclip size={20} />
              </button>
              <input 
                type="text" 
                placeholder="Type your message..." 
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
              />
              <button className="p-2 text-slate-400 hover:text-orange-500 transition-colors">
                <Smile size={20} />
              </button>
              <button className="w-10 h-10 bg-[#FF6B4A] hover:bg-[#fa5a36] text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-orange-100 ml-2">
                <Send size={16} className="-ml-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
