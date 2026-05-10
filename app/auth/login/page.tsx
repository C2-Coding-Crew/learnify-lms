import LoginPage from "@/components/login/login";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}
