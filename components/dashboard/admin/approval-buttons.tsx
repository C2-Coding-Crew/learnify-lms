"use client";

import { useTransition } from "react";
import { approveCourse, rejectCourse } from "@/app/dashboard/admin/actions";
import { CheckCircle, XCircle } from "lucide-react";

export function ApprovalButtons({ courseId }: { courseId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      await approveCourse(courseId);
    });
  };

  const handleReject = () => {
    if (confirm("Are you sure you want to reject this course?")) {
      startTransition(async () => {
        await rejectCourse(courseId);
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleApprove}
        disabled={isPending}
        className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
        title="Approve Course"
      >
        <CheckCircle size={18} />
      </button>
      <button 
        onClick={handleReject}
        disabled={isPending}
        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
        title="Reject Course"
      >
        <XCircle size={18} />
      </button>
    </div>
  );
}
