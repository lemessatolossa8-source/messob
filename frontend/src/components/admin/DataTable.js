"use client";

import Link from "next/link";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getLocalizedText } from "@/i18n";

export default function DataTable({
  title,
  subtitle,
  items = [],
  total = 0,
  currentPage = 1,
  totalPages = 1,
  searchQuery = "",
  onSearchChange,
  statusFilter = "all",
  onStatusFilterChange,
  categoryFilter = "all",
  categories = [],
  onCategoryFilterChange,
  onPageChange,
  createHref,
  createLabel = "Add New",
  editHrefPrefix,
  viewHrefPrefix,
  onDelete,
  onTogglePublish,
  isLoading = false,
  emptyMessage = "No items found.",
  _customColumns = [],
}) {
  return (
    <div className="space-y-6">
      {/* Top action & title bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#070707] tracking-tight">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-normal">{subtitle}</p>}
        </div>

        {createHref && (
          <Link
            href={createHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D71920] hover:bg-[#b5141a] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-red-950/30 hover-lift transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>{createLabel}</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col gap-3 rounded-3xl border border-neutral-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search records..."
            className="w-full rounded-full border border-neutral-200 bg-[#F9FAFB] py-2.5 pl-11 pr-5 text-xs font-medium text-[#070707] placeholder-neutral-400 focus:border-[#D71920] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D71920]/15 transition"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          {onStatusFilterChange && (
            <div className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-[#F9FAFB] p-1 text-xs">
              <button
                type="button"
                onClick={() => onStatusFilterChange("all")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#070707] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#070707]"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onStatusFilterChange("published")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  statusFilter === "published"
                    ? "bg-[#070707] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#070707]"
                }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => onStatusFilterChange("draft")}
                className={`rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                  statusFilter === "draft"
                    ? "bg-[#070707] text-white shadow-xs"
                    : "text-neutral-600 hover:text-[#070707]"
                }`}
              >
                Draft
              </button>
            </div>
          )}

          {/* Category Dropdown */}
          {categories.length > 0 && onCategoryFilterChange && (
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-semibold text-[#070707] focus:border-[#070707] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3.5">Record</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Languages</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
                      <span className="text-xs font-semibold">Loading records...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <div className="space-y-2">
                      <p className="text-xs sm:text-sm font-semibold text-[#070707]">{emptyMessage}</p>
                      {createHref && (
                        <Link
                          href={createHref}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FE0002] hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create entry</span>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const title = getLocalizedText(item.title, "en") || getLocalizedText(item.title, "om") || "Untitled";
                  const hasOm = item.title?.om && item.title.om.trim() !== "";
                  const hasAm = item.title?.am && item.title.am.trim() !== "";
                  const hasEn = item.title?.en && item.title.en.trim() !== "";
                  const isPublished = item.status === "published";

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      {/* Image & Title */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image.startsWith("http") || item.image.startsWith("/") ? item.image : `/${item.image}`}
                              alt=""
                              className="h-10 w-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#070707] font-bold text-xs border border-slate-200/80">
                              {title.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <p className="truncate font-bold text-[#070707] text-xs sm:text-sm">
                              {title}
                            </p>
                            {item.summary || item.description ? (
                              <p className="truncate text-[11px] text-slate-500 mt-0.5">
                                {getLocalizedText(item.summary || item.description, "en") ||
                                  getLocalizedText(item.summary || item.description, "om")}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-[#070707]">
                          {item.category || item.department || "General"}
                        </span>
                      </td>

                      {/* Translations */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            title={hasOm ? "Afaan Oromo complete" : "Afaan Oromo missing"}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              hasOm
                                ? "bg-slate-100 text-[#070707] border border-slate-300"
                                : "bg-white text-slate-300 border border-slate-200 line-through opacity-50"
                            }`}
                          >
                            Afaan Oromo
                          </span>
                          <span
                            title={hasAm ? "Amharic complete" : "Amharic missing"}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              hasAm
                                ? "bg-slate-100 text-[#070707] border border-slate-300"
                                : "bg-white text-slate-300 border border-slate-200 line-through opacity-50"
                            }`}
                          >
                            አማርኛ
                          </span>
                          <span
                            title={hasEn ? "English complete" : "English missing"}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              hasEn
                                ? "bg-slate-100 text-[#070707] border border-slate-300"
                                : "bg-white text-slate-300 border border-slate-200 line-through opacity-50"
                            }`}
                          >
                            English
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                        {item.date || item.startDate || "—"}
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onTogglePublish && onTogglePublish(item)}
                          title={`Click to ${isPublished ? "set to draft" : "publish"}`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                            isPublished
                              ? "bg-[#070707] text-white border border-[#070707] hover:bg-black"
                              : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-[#FE0002]" : "bg-slate-400"}`} />
                          <span>{isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {viewHrefPrefix && (
                            <Link
                              href={`${viewHrefPrefix}/${item.id}`}
                              target="_blank"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#070707] transition cursor-pointer"
                              title="View live page"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}

                          {editHrefPrefix && (
                            <Link
                              href={`${editHrefPrefix}/${item.id}/edit`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#070707] transition cursor-pointer"
                              title="Edit record"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(item)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-[#FE0002] transition cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-5 py-3 text-xs text-slate-600">
            <div>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
              <strong>{total}</strong> records)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-[#070707] hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-[#070707] hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
