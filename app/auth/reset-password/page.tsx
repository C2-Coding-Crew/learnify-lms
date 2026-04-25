import { Suspense } from "react";
import ResetPasswordPage from "@/components/reset-password/reset-password";

export const metadata = {
  title: "Reset Password — Learnify LMS",
  description: "Buat password baru untuk akun Learnify kamu.",
};

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-[#FF6B4A] rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordPage />
    </Suspense>
  );
}
