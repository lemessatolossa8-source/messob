import { NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { verifyApiAuth } from "@/src/lib/apiAuth";

export async function PUT(request, { params }) {
  const auth = await verifyApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    await query("UPDATE projects SET is_published = 1, updated_at = NOW() WHERE id = ?", [id]);
    const rows = await query("SELECT * FROM projects WHERE id = ?", [id]);
    return NextResponse.json({
      success: true,
      message: "Project published successfully",
      data: rows[0],
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to publish project" },
      { status: 500 }
    );
  }
}
