import { NextResponse } from "next/server";
import { verifyApiAuth } from "@/src/lib/apiAuth";
import fs from "fs";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request) {
  const auth = await verifyApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image") || formData.get("video");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid file type. Only JPEG, PNG, WEBP, GIF, MP4, WebM, and MOV are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, message: "File exceeds the 50 MB size limit." },
        { status: 400 }
      );
    }

    // Resolve backend endpoint
    const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
    const defaultBackend = isProd
      ? "https://burayu-mesob-backend.onrender.com"
      : "http://127.0.0.1:5000";

    const rawBackendUrl =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      defaultBackend;

    let backendUrl = rawBackendUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
    if (isProd && (backendUrl.includes("localhost") || backendUrl.includes("127.0.0.1"))) {
      backendUrl = "https://burayu-mesob-backend.onrender.com";
    }

    // Forward multipart file to backend /api/upload
    try {
      const backendFormData = new FormData();
      backendFormData.append("file", file, file.name);

      const authHeader =
        request.headers.get("authorization") ||
        (auth.user?.token ? `Bearer ${auth.user.token}` : "");

      const headers = {};
      if (authHeader) headers["Authorization"] = authHeader;

      const backendRes = await fetch(`${backendUrl}/api/upload`, {
        method: "POST",
        headers,
        body: backendFormData,
      });

      if (backendRes.ok) {
        const backendData = await backendRes.json();
        if (backendData.success) {
          return NextResponse.json(backendData);
        }
      } else {
        const errData = await backendRes.json().catch(() => null);
        console.warn(
          "Backend /api/upload returned non-200:",
          backendRes.status,
          errData
        );
      }
    } catch (backendErr) {
      console.warn("Proxy to backend upload failed:", backendErr.message);
    }

    // Fallback: Local filesystem write (supported in local development)
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const uploadDirFrontend = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(uploadDirFrontend)) {
        fs.mkdirSync(uploadDirFrontend, { recursive: true });
      }

      fs.writeFileSync(path.join(uploadDirFrontend, uniqueName), buffer);
      return NextResponse.json({ success: true, url: `/uploads/${uniqueName}` });
    } catch (localFsErr) {
      console.error("Local filesystem upload fallback failed:", localFsErr.message);
      throw localFsErr;
    }
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
