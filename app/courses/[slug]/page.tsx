import { Metadata } from "next";
import { notFound } from "next/navigation";
import CourseDetailClient from "@/components/courses/course-detail";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/courses/${slug}`,
      { cache: "no-store" }
    );
    if (!res.ok) return { title: "Kursus — Learnify" };
    const course = await res.json();
    return {
      title: `${course.title} — Learnify`,
      description: course.description,
    };
  } catch {
    return { title: "Kursus — Learnify" };
  }
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/courses/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const course = await res.json();

  return <CourseDetailClient course={course} />;
}
