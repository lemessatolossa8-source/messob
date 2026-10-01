"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Globe,
  ArrowUpDown,
} from "lucide-react";
import { getLocalizedText } from "@/src/i18n";

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
  customColumns = [],
}) {
  return (
    <div className="space-y-6">
      {/* Top action & filter bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>

        {createHref && (
          <Link
            href={createHref}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>{createLabel}</span>
          </Link>
        )}
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search items..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          {onStatusFilterChange && (
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
              <button
                type="button"
                onClick={() => onStatusFilterChange("all")}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => onStatusFilterChange("published")}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  statusFilter === "published" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Published
              </button>
              <button
                type="button"
                onClick={() => onStatusFilterChange("draft")}
                className={`rounded-lg px-3 py-1 font-bold transition ${
                  statusFilter === "draft" ? "bg-amber-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Draft
              </button>
            </div>
          )}

          {/* Category Filter */}
          {categories.length > 0 && onCategoryFilterChange && (
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-emerald-600 focus:outline-none"
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
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Translations</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      <span>Loading items...</span>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-500">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">{emptyMessage}</p>
                      {createHref && (
                        <Link
                          href={createHref}
                          className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:underline"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Create the first item</span>
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
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      {/* Image & Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="h-10 w-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                              {title.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <p className="truncate font-bold text-slate-900 text-sm">
                              {title}
                            </p>
                            {item.summary || item.description ? (
                              <p className="truncate text-xs text-slate-500">
                                {getLocalizedText(item.summary || item.description, "en") ||
                                  getLocalizedText(item.summary || item.description, "om")}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                          {item.category || item.department || "General"}
                        </span>
                      </td>

                      {/* Translations badges */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            title={hasOm ? "Afaan Oromoo completed" : "Afaan Oromoo missing"}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              hasOm ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400 line-through"
                            }`}
                          >
                            OM
                          </span>
                          <span
                            title={hasAm ? "Amharic completed" : "Amharic missing"}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              hasAm ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400 line-through"
                            }`}
                          >
                            AM
                          </span>
                          <span
                            title={hasEn ? "English completed" : "English missing"}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                              hasEn ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-400 line-through"
                            }`}
                          >
                            EN
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {item.date || item.startDate || "N/A"}
                      </td>

                      {/* Status & Quick Toggle */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onTogglePublish && onTogglePublish(item)}
                          title={`Click to ${isPublished ? "unpublish" : "publish"}`}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition ${
                            isPublished
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isPublished ? "bg-emerald-600" : "bg-amber-600"}`} />
                          <span>{isPublished ? "Published" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {viewHrefPrefix && (
                            <Link
                              href={`${viewHrefPrefix}/${item.id}`}
                              target="_blank"
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                              title="View live"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}

                          {editHrefPrefix && (
                            <Link
                              href={`${editHrefPrefix}/${item.id}/edit`}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 transition"
                              title="Edit item"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}

                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(item)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                              title="Delete item"
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
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/50 px-6 py-3 text-xs text-slate-600">
            <div>
              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> (
              <strong>{total}</strong> total items)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Prev</span>
              </button>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
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
