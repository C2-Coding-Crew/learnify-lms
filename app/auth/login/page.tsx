import LoginPage from "@/components/login/login";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
