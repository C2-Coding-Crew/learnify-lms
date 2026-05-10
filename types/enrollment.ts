// ─── Shared Types untuk Enrollment System ─────────────────────────────────

export type EnrollmentStatus = "active" | "completed" | "cancelled";
export type InvoiceStatus = "pending" | "paid" | "expired" | "cancelled";
export type TransactionStatus = "pending" | "settlement" | "expire" | "cancel";

export interface EnrollmentResponse {
  id: number;
  userId: string;
  courseId: number;
  enrollmentStatus: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnail: string | null;
    totalLessons: number;
    totalMinutes: number;
    level: string;
    category: { name: string; slug: string };
    instructor: { name: string; image: string | null };
  };
  _count: { progress: number };
}

export interface EnrollmentStatusCheck {
  isEnrolled: boolean;
  isWishlisted?: boolean;
  enrollment: {
    id: number;
    enrollmentStatus: string;
    enrolledAt: string;
    certificate?: { id: number } | null;
  } | null;
}

export interface InvoiceResponse {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  invoiceStatus: InvoiceStatus;
  dueDate: string;
}
