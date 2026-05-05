import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 3. Validate file type (allow images and documents)
    const allowedTypes = [
      "image/",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "application/zip"
    ];

    const isAllowed = allowedTypes.some(type => file.type.startsWith(type));

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Invalid file type. Only images and documents are allowed." },
        { status: 400 }
      );
    }

    // Optional: Max size check (e.g., 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File too large. Max 10MB allowed." },
        { status: 400 }
      );
    }

    // 4. Generate unique filename
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;
    
    // 5. Save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    
    try {
      const { mkdir } = await import("fs/promises");
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      // Directory might already exist or error
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // 6. Return public URL
    const url = `/uploads/${filename}`;
    return NextResponse.json({ url });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
