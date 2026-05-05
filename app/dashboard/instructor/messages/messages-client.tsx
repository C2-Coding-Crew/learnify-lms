"use client";

import React, { useState } from "react";
import { Search, MessageSquare } from "lucide-react";
import ChatRoom from "@/components/dashboard/chat/chat-room";

interface Course {
  id: number;
  title: string;
  _count: { enrollments: number };
}

interface MessagesClientProps {
  courses: Course[];
  currentUserId: string;
}

export default function MessagesClient({ courses, currentUserId }: MessagesClientProps) {
  const [activeCourseId, setActiveCourseId] = useState<number | null>(
    courses.length > 0 ? courses[0].id : null
  );

  const activeCourse = courses.find(c => c.id === activeCourseId);

  return (
    <div className="flex-1 bg-white rounded-[2rem] shadow-sm border border-slate-50 flex overflow-hidden min-h-[600px] mb-10">
      {/* Left Sidebar: Courses */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30 shrink-0">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-black text-slate-800 text-sm mb-4 uppercase tracking-widest">Course Groups</h3>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search groups..." 
              className="w-full pl-11 pr-4 h-11 bg-white rounded-xl border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-200 transition-all font-medium shadow-sm"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {courses.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs font-bold">
              No courses found. Create a course to start discussions.
            </div>
          ) : (
            courses.map((course) => (
              <div 
                key={course.id} 
                onClick={() => setActiveCourseId(course.id)}
                className={`p-5 border-b border-slate-100 flex gap-4 cursor-pointer hover:bg-white transition-colors items-center ${
                  activeCourseId === course.id ? 'bg-white border-l-4 border-l-[#FF6B4A]' : 'border-l-4 border-l-transparent'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                  activeCourseId === course.id ? 'bg-[#FF6B4A] text-white shadow-lg shadow-orange-100' : 'bg-orange-50 text-[#FF6B4A]'
                }`}>
                  {course.title.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-slate-800 text-sm truncate pr-2">{course.title}</h4>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">
                    {course._count.enrollments} Students
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Content: Active Chat */}
      {activeCourse ? (
        <ChatRoom 
          courseId={activeCourse.id}
          courseTitle={activeCourse.title}
          currentUserId={currentUserId}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4 bg-[#F8F9FB]">
          <MessageSquare size={64} className="opacity-10" />
          <p className="font-black text-sm uppercase tracking-widest opacity-30">Select a course to start chatting</p>
        </div>
      )}
    </div>
  );
}
