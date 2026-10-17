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
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { getLocalizedText } from "@/src/i18n";

export default function SlideImageAdminPage() {
  const [slides, setSlides] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadData = async () => {
    try {
      const res = await slideService.getAll({
        search,
        status: statusFilter,
        limit: 50,
      });
      setSlides(res.items || []);
    } catch (err) {
      console.error("Failed to load slides:", err);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = slideService.subscribe(loadData);
    return () => unsub();
  }, [search, statusFilter]);

  const handleTogglePublish = async (item) => {
    try {
      if (item.status === "published") {
        await slideService.unpublish(item.id);
        toast.info("Slide image moved to draft.");
      } else {
        await slideService.publish(item.id);
        toast.success("Slide image published to homepage!");
      }
      loadData();
    } catch {
      toast.error("Failed to update slide status.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await slideService.delete(deleteTarget.id);
      toast.success("Slide image deleted successfully.");
      setDeleteTarget(null);
      loadData();
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
          <div>
            <h2 className="text-xl font-extrabold text-[#070707]">Homepage Slides Management</h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 mt-1">
              {slides.length} Slides
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage homepage hero carousel background images
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-[#070707] hover:bg-slate-50 shadow-xs transition"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            <span>Preview Homepage</span>
          </Link>

          <Link
            href="/admin/dashboard/slide-image/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#CC0002]"
          >
            <Plus className="h-4 w-4 text-white" />
            <span>Add Slide</span>
          </Link>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search slides..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9.5 pr-4 text-xs font-medium text-[#070707] placeholder:text-slate-400 focus:border-[#FE0002] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#FE0002]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#070707] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({slides.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "published"
                ? "bg-[#070707] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Published ({totalPublished})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
              statusFilter === "draft"
                ? "bg-[#070707] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
          <h3 className="mt-4 text-base font-bold text-[#070707]">No slide images found</h3>
          <p className="mt-1 text-xs text-slate-500">
            Get started by creating your first hero carousel background image.
          </p>
          <div className="mt-6">
            <Link
              href="/admin/dashboard/slide-image/create"
              className="inline-flex items-center gap-2 rounded-xl bg-[#FE0002] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#CC0002] transition shadow-xs cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Slide</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, index) => {
            const isPub = slide.status === "published";

            return (
              <div
                key={slide.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 ease-out hover:border-[#FE0002]"
              >
                {/* Image Banner Container */}
                <div className="relative h-64 w-full bg-[#070707] overflow-hidden">
                  <img
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Badge & Order */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide backdrop-blur-md ${
                        isPub
                          ? "bg-black/80 text-white border border-white/20"
                          : "bg-white/90 text-[#070707] border border-black/10"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isPub ? "bg-[#FE0002]" : "bg-slate-400"}`} />
                      <span>{isPub ? "Published" : "Draft"}</span>
                    </span>

                    <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                      Order #{slide.order || index + 1}
                    </span>
                  </div>
                </div>

                {/* Content body */}
                <div className="flex flex-1 flex-col justify-between p-5">
                  <div>
                    <h3 className="text-base font-bold text-[#070707]">Slide Image #{slide.order || index + 1}</h3>
                    <p className="mt-2 text-xs text-slate-600">
                      {slide.image ? "Background image for homepage carousel" : "No image uploaded"}
                    </p>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(slide)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                        isPub
                          ? "border border-slate-200 text-slate-600 hover:bg-slate-100"
                          : "bg-[#FE0002] text-white hover:bg-[#CC0002]"
                      }`}
                    >
                      {isPub ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      <span>{isPub ? "Unpublish" : "Publish"}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/dashboard/slide-image/${slide.id}/edit`}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-[#070707] hover:border-[#FE0002] hover:text-[#FE0002] transition cursor-pointer"
                        title="Edit Slide"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(slide)}
                        className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:border-[#FE0002] hover:text-[#FE0002] transition cursor-pointer"
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
        itemName={deleteTarget ? `Slide #${deleteTarget.order}` : ""}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isProcessing={isDeleting}
      />
    </div>
  );
}
