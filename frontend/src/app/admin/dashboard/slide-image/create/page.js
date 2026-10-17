"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Send } from "lucide-react";
import { ImagePickerInput, SelectInput, TextInput } from "@/components/admin/FormControls";
import { slideService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";

export default function CreateSlideImagePage() {
  const router = useRouter();
  const toast = useToast();

  const [formData, setFormData] = useState({
    image: "",
    order: 1,
    status: "published",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.image || !formData.image.trim()) {
      newErrors.image = "Please upload or provide a slide image URL.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e, targetStatus) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const isValid = validateForm();
    if (!isValid) {
      setIsSubmitting(false);
      toast.error("Please upload a slide image.");
      return;
    }

    try {
      await slideService.create({
        image: formData.image,
        order: Number(formData.order) || 1,
        status: targetStatus,
      });

      toast.success(
        targetStatus === "published"
          ? "Slide image created and published to homepage!"
          : "Slide image saved as draft."
      );
      router.push("/admin/dashboard/slide-image");
    } catch (err) {
      console.error("Create slide error:", err);
      toast.error("Failed to create slide image.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/slide-image"
            className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-[#070707]">Add New Slide</h2>
            <p className="text-xs text-slate-500">
              Add a new carousel background image for the homepage hero section
            </p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="space-y-5">
          <ImagePickerInput
            label="Slide Background Image"
            value={formData.image}
            onChange={(v) => handleFieldChange("image", v)}
            error={errors.image}
            required
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Display Order (Sequence in Carousel)"
              type="number"
              value={formData.order}
              onChange={(v) => handleFieldChange("order", v)}
              placeholder="1"
            />

            <SelectInput
              label="Publish Status"
              value={formData.status}
              onChange={(v) => handleFieldChange("status", v)}
              options={[
                { value: "published", label: "Published (Live on Home Page)" },
                { value: "draft", label: "Draft (Hidden from Public)" },
              ]}
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100 pt-6">
          <Link
            href="/admin/dashboard/slide-image"
            className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#070707] hover:bg-slate-50 transition text-center"
          >
            Cancel
          </Link>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "draft")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-5 py-2.5 text-xs font-bold text-[#070707] hover:bg-slate-200 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Save as Draft</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={(e) => handleSubmit(e, "published")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#FE0002] px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#CC0002] transition disabled:opacity-50"
          >
            <Send className="h-4 w-4 text-white" />
            <span>{isSubmitting ? "Publishing..." : "Publish Slide Image"}</span>
          </button>
        </div>
      </form>

      {/* Live Preview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
          Preview
        </h3>
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 h-64 flex items-center justify-center">
          {formData.image ? (
            <>
              <img
                src={formData.image}
                alt="Slide preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute top-3 right-3">
                <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                  Order #{formData.order}
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">No image selected yet</p>
          )}
        </div>
        <p className="mt-3 text-center text-[10px] text-slate-400">
          This image will appear in the homepage hero carousel
        </p>
      </div>
    </div>
  );
}
