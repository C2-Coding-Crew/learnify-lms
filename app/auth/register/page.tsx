import RegisterPage from "@/components/register/register";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RegisterPage />
    </Suspense>
  );
}
