import { NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { verifyApiAuth } from "@/src/lib/apiAuth";

// Helper to format project row from MySQL
function formatProject(row) {
  if (!row) return null;

  let title = row.title;
  let description = row.description;
  let content = row.content;

  if (typeof title === "string") {
    try { title = JSON.parse(title); } catch {}
  }
  if (typeof description === "string") {
    try { description = JSON.parse(description); } catch {}
  }
  if (typeof content === "string") {
    try { content = JSON.parse(content); } catch {}
  }

  const isPublished = Boolean(row.is_published);

  return {
    id: row.id,
    _id: row.id,
    title: title || { om: "", am: "", en: "" },
    description: description || { om: "", am: "", en: "" },
    content: content || { om: "", am: "", en: "" },
    image: row.image || "",
    location: row.location || "Burayu",
    start_date: row.start_date ? String(row.start_date).split("T")[0] : null,
    end_date: row.end_date ? String(row.end_date).split("T")[0] : null,
    startDate: row.start_date ? String(row.start_date).split("T")[0] : "",
    targetCompletion: row.end_date ? String(row.end_date).split("T")[0] : "",
    status: isPublished ? "published" : "draft",
    projectStatus: row.status || "Planned",
    department: row.department || "Infrastructure",
    category: row.department || "Infrastructure",
    progress: Number(row.progress) || 0,
    is_published: isPublished,
    budget: row.budget || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// GET /api/projects/[id]
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const rows = await query("SELECT * FROM projects WHERE id = ?", [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const project = formatProject(rows[0]);
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("GET /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]
export async function PUT(request, { params }) {
  const auth = await verifyApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    const existingRows = await query("SELECT * FROM projects WHERE id = ?", [id]);
    if (!existingRows || existingRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    const current = existingRows[0];

    const title = body.title !== undefined
      ? (typeof body.title === "object" ? JSON.stringify(body.title) : JSON.stringify({ om: body.title, am: body.title, en: body.title }))
      : current.title;

    const description = body.description !== undefined
      ? (typeof body.description === "object" ? JSON.stringify(body.description) : JSON.stringify({ om: body.description, am: body.description, en: body.description }))
      : current.description;

    const content = body.content !== undefined
      ? (typeof body.content === "object" ? JSON.stringify(body.content) : JSON.stringify({ om: body.content, am: body.content, en: body.content }))
      : current.content;

    const image = body.image !== undefined ? body.image : current.image;
    const location = body.location !== undefined ? body.location : current.location;
    const startDate = body.start_date !== undefined ? body.start_date : (body.startDate !== undefined ? body.startDate : current.start_date);
    const endDate = body.end_date !== undefined ? body.end_date : (body.targetCompletion !== undefined ? body.targetCompletion : current.end_date);
    const status = body.projectStatus !== undefined
      ? body.projectStatus
      : (body.status && ["Planned", "Ongoing", "Completed", "Suspended"].includes(body.status) ? body.status : current.status);

    const department = body.department !== undefined ? body.department : (body.category !== undefined ? body.category : current.department);
    const progress = body.progress !== undefined ? Math.min(100, Math.max(0, parseInt(body.progress, 10) || 0)) : current.progress;
    
    let isPublished = current.is_published;
    if (body.is_published !== undefined) {
      isPublished = body.is_published ? 1 : 0;
    } else if (body.status === "published") {
      isPublished = 1;
    } else if (body.status === "draft") {
      isPublished = 0;
    }

    const budget = body.budget !== undefined ? body.budget : current.budget;

    const updateSql = `
      UPDATE projects SET
        title = ?, description = ?, content = ?, image = ?,
        location = ?, start_date = ?, end_date = ?, status = ?,
        department = ?, progress = ?, is_published = ?, budget = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await query(updateSql, [
      title,
      description,
      content,
      image,
      location,
      startDate || null,
      endDate || null,
      status,
      department,
      progress,
      isPublished,
      budget,
      id,
    ]);

    const updatedRows = await query("SELECT * FROM projects WHERE id = ?", [id]);
    const updatedProject = formatProject(updatedRows[0]);

    return NextResponse.json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error("PUT /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]
export async function DELETE(request, { params }) {
  const auth = await verifyApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const existing = await query("SELECT id FROM projects WHERE id = ?", [id]);

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    await query("DELETE FROM projects WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/projects/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
