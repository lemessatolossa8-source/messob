import { NextResponse } from "next/server";
import { query } from "@/src/lib/db";
import { verifyApiAuth } from "@/src/lib/apiAuth";

// Helper: returns true if the request carries a valid JWT
async function isAuthenticatedAdmin(request) {
  const result = await verifyApiAuth(request);
  return result.ok;
}

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

// GET /api/projects
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "20", 10));
    const offset = (page - 1) * limit;

    const isAdmin = await isAuthenticatedAdmin(request);

    const conditions = [];
    const params = [];

    // Public users only see published projects
    if (!isAdmin) {
      conditions.push("is_published = 1");
    } else {
      if (status === "published") {
        conditions.push("is_published = 1");
      } else if (status === "draft" || status === "unpublished") {
        conditions.push("is_published = 0");
      }
    }

    // Category / Department filter
    if (category && category !== "all" && category !== "All") {
      conditions.push("department = ?");
      params.push(category);
    }

    // Search query filter
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push("(CAST(title AS CHAR) LIKE ? OR location LIKE ? OR department LIKE ?)");
      params.push(q, q, q);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // 1. Get total count
    const countSql = `SELECT COUNT(*) as total FROM projects ${whereClause}`;
    const countRows = await query(countSql, params);
    const total = countRows[0]?.total || 0;

    // 2. Get paginated items
    const selectSql = `SELECT * FROM projects ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const rows = await query(selectSql, [...params, limit, offset]);

    const items = rows.map(formatProject);

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("GET /api/projects error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects
export async function POST(request) {
  const auth = await verifyApiAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    const title = typeof body.title === "object" ? JSON.stringify(body.title) : JSON.stringify({ om: body.title || "", am: body.title || "", en: body.title || "" });
    const description = typeof body.description === "object" ? JSON.stringify(body.description) : JSON.stringify({ om: body.description || "", am: body.description || "", en: body.description || "" });
    const content = typeof body.content === "object" ? JSON.stringify(body.content) : JSON.stringify({ om: body.content || "", am: body.content || "", en: body.content || "" });
    const image = body.image || "";
    const location = body.location || "Burayu";
    const startDate = body.start_date || body.startDate || null;
    const endDate = body.end_date || body.targetCompletion || null;
    const status = body.projectStatus || (["Planned", "Ongoing", "Completed", "Suspended"].includes(body.status) ? body.status : "Planned");
    const department = body.department || body.category || "Infrastructure";
    const progress = Math.min(100, Math.max(0, parseInt(body.progress, 10) || 0));
    const isPublished = body.is_published === true || body.is_published === 1 || body.status === "published" ? 1 : 0;
    const budget = body.budget || "";

    const insertSql = `
      INSERT INTO projects (
        title, description, content, image, location,
        start_date, end_date, status, department, progress,
        is_published, budget, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const result = await query(insertSql, [
      title,
      description,
      content,
      image,
      location,
      startDate,
      endDate,
      status,
      department,
      progress,
      isPublished,
      budget,
    ]);

    const insertId = result.insertId;
    const selectSql = `SELECT * FROM projects WHERE id = ?`;
    const rows = await query(selectSql, [insertId]);
    const createdProject = formatProject(rows[0]);

    return NextResponse.json(
      {
        success: true,
        message: "Project created successfully",
        data: createdProject,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/projects error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create project in MySQL" },
      { status: 500 }
    );
  }
}
