"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import LanguageTabs from "@/components/admin/language-tabs";
import { TextInput, TextAreaInput, SelectInput, ImagePickerInput } from "@/components/admin/form-controls";
import { eventService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateRequired, validateDate, validateTime, validateTimeRange, validateImage } from "@/src/lib/validation";

export default function CreateEventPage() {
  const router = useRouter();
  const toast = useToast();

  const [activeLang, setActiveLang] = useState("am");
  const [formData, setFormData] = useState({
    title: { om: "", am: "", en: "" },
    description: { om: "", am: "", en: "" },
    content: { om: "", am: "", en: "" },
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00 AM",
    endTime: "12:30 PM",
    location: "Burayu Civic Hall",
    organizer: "Burayu MESOB Leadership",
    image: "",
    eventStatus: "Upcoming",
    status: "published",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const hasAnyTitle = !!(formData.title.om?.trim() || formData.title.am?.trim() || formData.title.en?.trim());
    if (!hasAnyTitle) {
      newErrors.title_om = "Please enter an event title in at least one language.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm(targetStatus);
    if (!isValid) {
      setIsSubmitting(false);
      toast.error("Please enter an event title.");
      return;
    }

    try {
      const primaryTitle = formData.title.om?.trim() || formData.title.en?.trim() || formData.title.am?.trim();
      const primaryDesc = formData.description.om?.trim() || formData.description.en?.trim() || formData.description.am?.trim() || "";

      const finalTitle = {
        om: formData.title.om?.trim() || primaryTitle,
        am: formData.title.am?.trim() || primaryTitle,
        en: formData.title.en?.trim() || primaryTitle,
      };

      const finalDesc = {
        om: formData.description.om?.trim() || primaryDesc,
        am: formData.description.am?.trim() || primaryDesc,
        en: formData.description.en?.trim() || primaryDesc,
      };

      eventService.create({
        ...formData,
        title: finalTitle,
        description: finalDesc,
        location: formData.location || "Burayu City Hall",
        image: formData.image || "",
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "Event created and published successfully!"
          : "Event saved as draft."
      );
      router.push("/admin/dashboard/events");
    } catch (err) {
      console.error("Create event error:", err);
      toast.error("Failed to create event.");
    } finally {
      setIsSubmitting(false);
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
            <h2 className="text-xl font-extrabold text-slate-900">Create Event</h2>
            <p className="text-xs text-slate-500">Schedule town halls, civic forums, or community programs</p>
          </div>
        </div>
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
            placeholder="Event name or headline..."
          />

          <TextAreaInput
            label={`Short Description (${activeLang.toUpperCase()})`}
            required={activeLang === "om"}
            rows={2}
            value={formData.description[activeLang]}
            onChange={(v) => handleFieldChange("description", activeLang, v)}
            error={errors[`description_${activeLang}`]}
            placeholder="Key event highlights..."
          />

          <TextAreaInput
            label={`Full Program Details (${activeLang.toUpperCase()})`}
            rows={5}
            value={formData.content[activeLang]}
            onChange={(v) => handleFieldChange("content", activeLang, v)}
            placeholder="Detailed agenda, speakers, objectives..."
          />
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Schedule, Location & Logistics
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Event Date"
              type="date"
              required
              value={formData.date}
              onChange={(v) => handleFieldChange("date", null, v)}
              error={errors.date}
            />

            <TextInput
              label="Start Time"
              value={formData.startTime}
              onChange={(v) => handleFieldChange("startTime", null, v)}
              placeholder="09:00 AM"
            />

            <TextInput
              label="End Time"
              value={formData.endTime}
              onChange={(v) => handleFieldChange("endTime", null, v)}
              error={errors.endTime}
              placeholder="12:30 PM"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Location"
              required
              value={formData.location}
              onChange={(v) => handleFieldChange("location", null, v)}
              error={errors.location}
              placeholder="e.g. Burayu Civic Hall, Koye Feche"
            />

            <TextInput
              label="Organizer / Bureau"
              value={formData.organizer}
              onChange={(v) => handleFieldChange("organizer", null, v)}
              placeholder="e.g. Burayu MESOB Leadership"
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
            <span>{isSubmitting ? "Publishing..." : "Publish Event"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
