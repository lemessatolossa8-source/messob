import { NextResponse } from "next/server";
import { verifyApiAuth } from "@/src/lib/apiAuth";
import fs from "fs";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request) {
  const auth = await verifyApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Invalid file type. Only JPEG, PNG, WEBP, GIF, MP4, WebM, and MOV are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "File exceeds the 50 MB size limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Build a safe, unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploadDirFrontend = path.join(process.cwd(), "public", "uploads");
    const uploadDirBackend = path.join(process.cwd(), "..", "backend", "uploads");

    if (!fs.existsSync(uploadDirFrontend)) {
      fs.mkdirSync(uploadDirFrontend, { recursive: true });
    }
    if (!fs.existsSync(uploadDirBackend)) {
      fs.mkdirSync(uploadDirBackend, { recursive: true });
    }

    const filePathFrontend = path.join(uploadDirFrontend, uniqueName);
    const filePathBackend = path.join(uploadDirBackend, uniqueName);

    fs.writeFileSync(filePathFrontend, buffer);
    try {
      fs.writeFileSync(filePathBackend, buffer);
    } catch {
      // Ignore if backend directory fails
    }

    return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
