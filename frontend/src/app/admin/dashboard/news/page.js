"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { newsService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { getLocalizedText } from "@/src/i18n";
import { getImageUrl } from "@/src/lib/imageUrl";

export default function AdminNewsListPage() {
  const [data, setData] = useState({ items: [], total: 0, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  const loadNews = async () => {
    try {
      setIsLoading(true);
      const res = await newsService.getAll({
        search,
        status,
        page,
        limit: 10,
      });
      setData(res || { items: [], total: 0, totalPages: 1 });
    } catch (err) {
      console.error("Failed to load news:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
    const unsub = newsService.subscribe(loadNews);
    return () => unsub();
  }, [search, status, page]);

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === "published") {
        await newsService.unpublish(item.id);
        toast.info("Moved to draft.");
      } else {
        await newsService.publish(item.id);
        toast.success("News published successfully.");
      }
      loadNews();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await newsService.delete(deleteTarget.id);
      toast.success("News deleted successfully.");
      setDeleteTarget(null);
      loadNews();
    } catch {
      toast.error("Failed to delete news.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#000000] tracking-tight">News Management</h1>
        </div>
        <Link
          href="/admin/dashboard/news/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D71920] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#b5141a] transition"
        >
          <Plus className="h-4 w-4" />
          <span>Add News</span>
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
            placeholder="Search news..."
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2 pl-10 pr-4 text-xs font-medium text-[#000000] placeholder-neutral-400 focus:border-[#D71920] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#D71920] transition"
          />
        </div>

        {/* Status Filter */}
        <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setStatus("all");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
              status === "all"
                ? "bg-[#000000] text-[#FFFFFF] shadow-xs"
                : "text-neutral-600 hover:text-[#000000]"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("published");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
              status === "published"
                ? "bg-[#000000] text-[#FFFFFF] shadow-xs"
                : "text-neutral-600 hover:text-[#000000]"
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => {
              setStatus("draft");
              setPage(1);
            }}
            className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
              status === "draft"
                ? "bg-[#000000] text-[#FFFFFF] shadow-xs"
                : "text-neutral-600 hover:text-[#000000]"
            }`}
          >
            Draft
          </button>
        </div>
      </div>

      {/* News Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-5 py-3.5">News Article</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2 text-xs font-semibold">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#D71920] border-t-transparent" />
                      <span>Loading news...</span>
                    </div>
                  </td>
                </tr>
              ) : data.items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-neutral-400">
                    <p className="text-xs font-medium">No news articles found.</p>
                  </td>
                </tr>
              ) : (
                data.items.map((item) => {
                  const title =
                    getLocalizedText(item.title, "en") ||
                    getLocalizedText(item.title, "om") ||
                    getLocalizedText(item.title, "am") ||
                    (typeof item.title === "string" ? item.title : "Untitled News");

                  const isPublished = item.status === "published";
                  const imageUrl = item.image ? getImageUrl(item.image) : "";

                  return (
                    <tr key={item.id} className="hover:bg-neutral-50/80 transition">
                      {/* Image + Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt=""
                              className="h-11 w-14 rounded-lg object-cover bg-neutral-100 shrink-0 border border-neutral-200"
                            />
                          ) : (
                            <div className="flex h-11 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 font-bold text-xs border border-neutral-200">
                              News
                            </div>
                          )}
                          <div className="min-w-0 max-w-md sm:max-w-xl">
                            <p className="font-bold text-[#000000] text-xs sm:text-sm line-clamp-1">
                              {title}
                            </p>
                            {item.summary && (
                              <p className="text-neutral-500 text-[11px] line-clamp-1 mt-0.5">
                                {getLocalizedText(item.summary, "en") ||
                                  getLocalizedText(item.summary, "om") ||
                                  getLocalizedText(item.summary, "am")}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            isPublished
                              ? "bg-[#000000] text-[#FFFFFF]"
                              : "bg-neutral-200 text-neutral-700"
                          }`}
                        >
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(item)}
                            title={isPublished ? "Unpublish to draft" : "Publish news"}
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-[#000000] transition cursor-pointer"
                          >
                            {isPublished ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>

                          <Link
                            href={`/admin/dashboard/news/${item.id}/edit`}
                            title="Edit news"
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-[#000000] transition"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            title="Delete news"
                            className="rounded-lg p-1.5 text-neutral-500 hover:bg-red-50 hover:text-[#D71920] transition cursor-pointer"
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
          <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 text-xs text-neutral-600">
            <span>
              Page {page} of {data.totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-40 transition cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages}
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                className="rounded-lg border border-neutral-200 p-1.5 hover:bg-neutral-50 disabled:opacity-40 transition cursor-pointer"
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
        title="Delete News"
        message="Are you sure you want to delete this news article? This action cannot be undone."
        itemName={
          deleteTarget
            ? getLocalizedText(deleteTarget.title, "en") ||
              getLocalizedText(deleteTarget.title, "om") ||
              (typeof deleteTarget.title === "string" ? deleteTarget.title : "")
            : ""
        }
        confirmLabel="Delete News"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
