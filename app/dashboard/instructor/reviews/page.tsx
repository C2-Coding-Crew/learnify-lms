import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import InstructorHeader from "@/components/dashboard/instructor/header";
import ReviewsClient from "@/app/dashboard/instructor/reviews/reviews-client";

export default async function InstructorReviewsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) redirect("/auth/login");

  const roleId = (session.user as any).roleId;
  if (Number(roleId) !== 2) redirect("/dashboard");

  const instructorId = session.user.id;

  // Fetch all reviews for this instructor's courses
  const reviews = await db.review.findMany({
    where: {
      course: { instructorId, isDeleted: 0 },
      isDeleted: 0,
      status: 1
    },
    include: {
      user: { select: { name: true, image: true, email: true } },
      course: { select: { title: true, id: true } }
    },
    orderBy: { createdDate: "desc" }
  });

  return (
    <main className="flex-1 p-6 md:p-10 max-w-[1600px] mx-auto w-full">
      <InstructorHeader 
        userName={session.user.name} 
        userRole="Instructor" 
        title="Student Reviews ⭐" 
        subtitle="Manage and respond to student feedback."
      />

      <ReviewsClient initialReviews={JSON.parse(JSON.stringify(reviews))} />
    </main>
  );
}
