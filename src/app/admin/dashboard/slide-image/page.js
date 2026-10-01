"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  ArrowRight,
  ExternalLink,
  Search,
  CheckCircle,
  Clock,
} from "lucide-react";
import { slideService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { getLocalizedText } from "@/src/i18n";

export default function SlideImageAdminPage() {
  const [slides, setSlides] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = () => {
    const res = slideService.getAll({
      search,
      status: statusFilter,
      limit: 50,
    });
    setSlides(res.items || []);
  };

  useEffect(() => {
    loadData();
    const unsub = slideService.subscribe(loadData);
    return () => unsub();
  }, [search, statusFilter]);

  const handleTogglePublish = (item) => {
    if (item.status === "published") {
      slideService.unpublish(item.id);
      toast.info("Slide image moved to draft.");
    } else {
      slideService.publish(item.id);
      toast.success("Slide image published to homepage!");
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      slideService.delete(deleteTarget.id);
      toast.success("Slide image deleted successfully.");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete slide image.");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPublished = slides.filter((s) => s.status === "published").length;
  const totalDraft = slides.filter((s) => s.status === "draft").length;

  return (
    <div className="space-y-6">
      {/* Header & Create Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">Homepage Slides Management</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
              {slides.length} Slides
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Control homepage hero carousel slides, welcome messages, headlines, buttons, and animations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>Preview Homepage</span>
          </Link>

          <Link
            href="/admin/dashboard/slide-image/create"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 text-amber-400" />
            <span>Add Slide</span>
          </Link>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search slides by title or welcome message..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              statusFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({slides.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              statusFilter === "published"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            Published ({totalPublished})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              statusFilter === "draft"
                ? "bg-amber-700 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            Draft ({totalDraft})
          </button>
        </div>
      </div>

      {/* Slide Cards Grid */}
      {slides.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">No slide images found</h3>
          <p className="mt-1 text-xs text-slate-500">
            Get started by creating your first hero slide image for the homepage carousel.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/dashboard/slide-image/create"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Add Slide</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, index) => {
            const titleText = getLocalizedText(slide.title, "en") || getLocalizedText(slide.title, "om") || "Untitled Slide";
            const welcomeText = getLocalizedText(slide.welcomeMessage, "en") || getLocalizedText(slide.welcomeMessage, "om") || "";
            const messageText = getLocalizedText(slide.message, "en") || getLocalizedText(slide.message, "om") || "";
            const isPub = slide.status === "published";

            return (
              <div
                key={slide.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                {/* Image Banner Container */}
                <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={slide.image || "https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=800&q=80"}
                    alt={titleText}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                  {/* Badge & Order */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md ${
                        isPub
                          ? "bg-emerald-500/90 text-white"
                          : "bg-amber-500/90 text-slate-950"
                      }`}
                    >
                      {isPub ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>{isPub ? "Published" : "Draft"}</span>
                    </span>

                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      Slide #{slide.order || index + 1}
                    </span>
                  </div>

                  {/* Welcome Message overlay preview */}
                  {welcomeText && (
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="inline-block truncate max-w-full rounded-full bg-emerald-950/80 border border-emerald-500/40 px-3 py-0.5 text-[10px] font-bold text-emerald-300">
                        {welcomeText}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content body */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{titleText}</h3>
                    <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {messageText || "No description provided."}
                    </p>

                    {/* Button Links Indicator */}
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-slate-100 text-[11px]">
                      {slide.primaryBtnLink && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800">
                          <span>Btn 1: {getLocalizedText(slide.primaryBtnText, "en") || "Explore"}</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                      {slide.secondaryBtnLink && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">
                          <span>Btn 2: {getLocalizedText(slide.secondaryBtnText, "en") || "Access"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(slide)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                        isPub
                          ? "border border-slate-200 text-slate-600 hover:bg-slate-100"
                          : "bg-emerald-600 text-white hover:bg-emerald-500"
                      }`}
                    >
                      {isPub ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{isPub ? "Unpublish" : "Publish"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/dashboard/slide-image/${slide.id}/edit`}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 transition"
                        title="Edit Slide"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(slide)}
                        className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 transition"
                        title="Delete Slide"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Slide Image"
        message="Are you sure you want to delete this slide from the homepage carousel?"
        itemName={deleteTarget ? getLocalizedText(deleteTarget.title, "en") || getLocalizedText(deleteTarget.title, "om") : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
