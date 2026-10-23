"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight, Calendar, MapPin, Building2 } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { projectService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";
import { getImageUrl } from "@/src/lib/imageUrl";

export default function AdminProjectsListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'published', 'draft'
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const loadProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await projectService.getAll({
        search,
        status: statusFilter,
        page,
        limit: 10,
      });
      setData(res || { items: [], total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Failed to load projects:", err);
      toast.error(err?.message || "Failed to load projects.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page, toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleTogglePublish = async (item) => {
    try {
      const isCurrentlyPublished = item.is_published || item.status === "published" || item.publishStatus === "published";
      if (isCurrentlyPublished) {
        await projectService.unpublish(item.id);
        toast.info("Project moved to draft.");
      } else {
        await projectService.publish(item.id);
        toast.success("Project published successfully.");
      }
      loadProjects();
    } catch (err) {
      toast.error("Failed to update status: " + (err?.message || "Server error"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await projectService.delete(deleteTarget.id);
      toast.success("Project deleted successfully.");
      setDeleteTarget(null);
      loadProjects();
    } catch (err) {
      toast.error("Failed to delete project: " + (err?.message || "Server error"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#000000] tracking-tight">Development Projects</h1>
        </div>
        <Link
          href="/admin/dashboard/projects/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D71920] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#b5141a] transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by project name or location..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 pl-10 pr-4 py-2 text-xs font-medium text-[#000000] placeholder-neutral-400 focus:border-[#D71920] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D71920]/15 transition"
          />
        </div>

        {/* Visibility Filter Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-neutral-100 p-1">
          {[
            { id: "all", label: "All" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Draft" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white text-[#000000] shadow-xs"
                  : "text-neutral-500 hover:text-[#000000]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50/75">
              <tr>
                <th className="px-5 py-3.5 font-bold text-[#000000] uppercase tracking-wider">Project</th>
                <th className="px-5 py-3.5 font-bold text-[#000000] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3.5 font-bold text-[#000000] uppercase tracking-wider">Progress</th>
                <th className="px-5 py-3.5 font-bold text-[#000000] uppercase tracking-wider">Dates</th>
                <th className="px-5 py-3.5 font-bold text-[#000000] uppercase tracking-wider">Visibility</th>
                <th className="px-5 py-3.5 text-right font-bold text-[#000000] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D71920] border-t-transparent" />
                      <span className="font-medium">Loading projects...</span>
                    </div>
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Building2 className="mx-auto h-8 w-8 text-neutral-300 mb-2" />
                    <p className="font-semibold text-neutral-600">No projects found.</p>
                  </td>
                </tr>
              ) : (
                data.items.map((item) => {
                  const title = getLocalizedText(item.title, "en") || getLocalizedText(item.title, "om") || getLocalizedText(item.title, "am") || "Untitled Project";
                  const imageUrl = getImageUrl(item.image);
                  const isPublished = item.is_published || item.status === "published" || item.publishStatus === "published";
                  const lifecycleStatus = item.projectStatus || (["Planned", "Ongoing", "Completed"].includes(item.status) ? item.status : "Planned");
                  const progressVal = Math.min(100, Math.max(0, Number(item.progress) || 0));

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/60 transition">
                      {/* Project info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="h-11 w-16 shrink-0 rounded-lg object-cover border border-neutral-200"
                            />
                          ) : (
                            <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-400">
                              <Building2 className="h-5 w-5" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-sm">
                            <p className="font-bold text-[#000000] line-clamp-1 text-sm">{title}</p>
                            {item.location && (
                              <p className="flex items-center gap-1 text-[11px] text-neutral-500 mt-0.5">
                                <MapPin className="h-3 w-3 text-[#D71920] shrink-0" />
                                <span className="truncate">{item.location}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            lifecycleStatus === "Completed"
                              ? "bg-neutral-900 text-white"
                              : lifecycleStatus === "Ongoing"
                              ? "bg-[#D71920] text-white"
                              : "bg-neutral-100 text-neutral-800 border border-neutral-200"
                          }`}
                        >
                          {lifecycleStatus}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="w-28 space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-[#000000]">{progressVal}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#D71920] rounded-full transition-all"
                              style={{ width: `${progressVal}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="px-5 py-4 whitespace-nowrap text-neutral-600">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                          <span>
                            {item.start_date || item.startDate || "—"}
                            {(item.end_date || item.expectedCompletionDate || item.targetCompletion) ? (
                              <span className="text-neutral-400"> → {item.end_date || item.expectedCompletionDate || item.targetCompletion}</span>
                            ) : null}
                          </span>
                        </div>
                      </td>

                      {/* Visibility */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isPublished
                              ? "bg-black text-white"
                              : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isPublished ? "bg-white" : "bg-neutral-400"
                            }`}
                          />
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item)}
                            title={isPublished ? "Move to draft" : "Publish project"}
                            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-[#000000] transition cursor-pointer"
                          >
                            {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>

                          <Link
                            href={`/admin/dashboard/projects/${item.id}/edit`}
                            title="Edit project"
                            className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-[#000000] transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete project"
                            className="rounded-lg p-2 text-neutral-500 hover:bg-[#D71920]/10 hover:text-[#D71920] transition cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3.5 bg-neutral-50/50">
            <p className="text-xs text-neutral-500">
              Showing page <span className="font-bold text-[#000000]">{page}</span> of{" "}
              <span className="font-bold text-[#000000]">{data.totalPages}</span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-neutral-200 bg-white p-1.5 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Project"
        message="Are you sure you want to delete this development project? This action cannot be undone."
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") || "" : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
