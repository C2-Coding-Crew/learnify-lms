import { NextRequest } from "next/server";
import { pubsub } from "@/lib/pubsub";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return new Response("Missing courseId", { status: 400 });
  }

  const channel = `course_${courseId}_discussions`;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Initial connection established
      controller.enqueue(encoder.encode("event: connected\ndata: ok\n\n"));

      const listener = (event: any) => {
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        } catch (e) {
          console.error("SSE encoding error", e);
        }
      };

      const unsubscribe = pubsub.subscribe(channel, listener);

      request.signal.addEventListener("abort", () => {
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
