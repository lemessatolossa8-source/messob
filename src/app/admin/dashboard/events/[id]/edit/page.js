"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send, Trash2 } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, ImagePickerInput } from "@/components/admin/form-controls";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import { eventService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateTimeRange, validateImage } from "@/src/lib/validation";

export default function EditEventPage() {
  const router = useRouter();
  const routeParams = useParams();
  const id = routeParams?.id;
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const item = eventService.getById(id);
      if (item) {
        setFormData({
          title: typeof item.title === "object" ? item.title : { om: item.title, am: "", en: "" },
          description: typeof item.description === "object" ? item.description : { om: item.description || "", am: "", en: "" },
          content: typeof item.content === "object" ? item.content : { om: item.content || "", am: "", en: "" },
          date: item.date || new Date().toISOString().split("T")[0],
          startTime: item.startTime || "09:00 AM",
          endTime: item.endTime || "12:30 PM",
          location: item.location || "Burayu Civic Hall",
          organizer: item.organizer || "Burayu MESOB Leadership",
          image: item.image || "",
          eventStatus: item.eventStatus || "Upcoming",
          status: item.status || "published",
        });
      } else {
        toast.error("Event not found.");
        router.push("/admin/dashboard/events");
      }
    }
  }, [id, router, toast]);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading event...</span>
        </div>
      </div>
    );
  }

  const handleFieldChange = (field, lang, value) => {
    if (lang) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [lang]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    const errorKey = lang ? `${field}_${lang}` : field;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  const validateForm = (targetStatus) => {
    const newErrors = {};
    if (!formData.title.om || formData.title.om.trim() === "") {
      newErrors.title_om = "Afaan Oromoo title is required.";
    }
    if (targetStatus === "published") {
      if (!formData.title.am || formData.title.am.trim() === "") {
        newErrors.title_am = "Amharic title is required before publishing.";
      }
      if (!formData.title.en || formData.title.en.trim() === "") {
        newErrors.title_en = "English title is required before publishing.";
      }
    }

    const timeRangeErr = validateTimeRange(formData.startTime, formData.endTime);
    if (timeRangeErr) newErrors.endTime = timeRangeErr;

    const imgErr = validateImage(formData.image);
    if (imgErr) newErrors.image = imgErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm(targetStatus);
    if (!isValid) {
      setIsSubmitting(false);
      toast.error("Please resolve event validation errors.");
      return;
    }

    try {
      eventService.update(id, {
        ...formData,
        status: targetStatus,
      });

      toast.success("Event updated successfully!");
      router.push("/admin/dashboard/events");
    } catch {
      toast.error("Failed to update event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    try {
      eventService.delete(id);
      toast.success("Event deleted.");
      router.push("/admin/dashboard/events");
    } catch {
      toast.error("Failed to delete event.");
    }
  };

  const langStatus = {
    om: !!formData.title.om?.trim(),
    am: !!formData.title.am?.trim(),
    en: !!formData.title.en?.trim(),
  };

  const tabErrors = {
    om: errors.title_om || errors.description_om,
    am: errors.title_am || errors.description_am,
    en: errors.title_en || errors.description_en,
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/events"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Edit Event</h2>
            <p className="text-xs text-slate-500">Update schedule, location, and event content</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition inline-flex items-center gap-1.5"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <LanguageTabs
          activeTab={activeLang}
          onTabChange={setActiveLang}
          status={langStatus}
          errors={tabErrors}
        />

        <div className="space-y-5">
          <TextInput
            label={`Event Title (${activeLang.toUpperCase()})`}
            required={activeLang === "om"}
            value={formData.title[activeLang]}
            onChange={(v) => handleFieldChange("title", activeLang, v)}
            error={errors[`title_${activeLang}`]}
            placeholder="Event name..."
          />

          <TextAreaInput
            label={`Description (${activeLang.toUpperCase()})`}
            rows={2}
            value={formData.description[activeLang]}
            onChange={(v) => handleFieldChange("description", activeLang, v)}
            error={errors[`description_${activeLang}`]}
            placeholder="Short description..."
          />

          <TextAreaInput
            label={`Full Program Details (${activeLang.toUpperCase()})`}
            rows={5}
            value={formData.content[activeLang]}
            onChange={(v) => handleFieldChange("content", activeLang, v)}
            placeholder="Details..."
          />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Schedule & Location
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Event Date"
              type="date"
              value={formData.date}
              onChange={(v) => handleFieldChange("date", null, v)}
            />

            <TextInput
              label="Start Time"
              value={formData.startTime}
              onChange={(v) => handleFieldChange("startTime", null, v)}
            />

            <TextInput
              label="End Time"
              value={formData.endTime}
              onChange={(v) => handleFieldChange("endTime", null, v)}
              error={errors.endTime}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Location"
              value={formData.location}
              onChange={(v) => handleFieldChange("location", null, v)}
            />

            <TextInput
              label="Organizer"
              value={formData.organizer}
              onChange={(v) => handleFieldChange("organizer", null, v)}
            />
          </div>

          <ImagePickerInput
            label="Event Cover Image"
            value={formData.image}
            onChange={(v) => handleFieldChange("image", null, v)}
            error={errors.image}
          />
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/events"
            className="w-full sm:w-auto rounded-full border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
          >
            <Send className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Updating..." : "Update & Publish"}</span>
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Event"
        message="Are you sure you want to delete this event?"
        itemName={formData?.title?.om || formData?.title?.en || ""}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
