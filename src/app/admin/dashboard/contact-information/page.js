"use client";

import { useState, useEffect } from "react";
import { Save, PhoneCall, Mail, MapPin, Clock, Globe } from "lucide-react";
import { TextInput, TextAreaInput } from "@/components/admin/form-controls";
import { siteService } from "@/src/services";
import { useToast } from "@/src/context/ToastContext";
import { validateEmail, validatePhone, validateUrl, validateRequired } from "@/src/lib/validation";

export default function ContactInformationCMSPage() {
  const toast = useToast();
  const [formData, setFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const contact = siteService.getContactInfo();
    if (contact) {
      setFormData(contact);
    }
  }, []);

  if (!formData) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>Loading contact settings...</span>
        </div>
      </div>
    );
  }

  const handleChange = (field, value, subfield) => {
    if (subfield) {
      setFormData((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    const errorKey = subfield ? `${field}_${subfield}` : field;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[errorKey];
        return copy;
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};

    const addrErr = validateRequired(formData.address, "Office Address");
    if (addrErr) newErrors.address = addrErr;

    const emailErr = validateEmail(formData.email, true);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.phone, true);
    if (phoneErr) newErrors.phone = phoneErr;

    if (formData.website) {
      const urlErr = validateUrl(formData.website);
      if (urlErr) newErrors.website = urlErr;
    }

    if (formData.socialMedia?.facebook) {
      const fbErr = validateUrl(formData.socialMedia.facebook);
      if (fbErr) newErrors.socialMedia_facebook = fbErr;
    }

    if (formData.socialMedia?.telegram) {
      const tgErr = validateUrl(formData.socialMedia.telegram);
      if (tgErr) newErrors.socialMedia_telegram = tgErr;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      toast.error("Please fix form errors before saving.");
      return;
    }

    try {
      siteService.updateContactInfo(formData);
      toast.success("Contact details and municipal channels saved successfully!");
    } catch {
      toast.error("Failed to save contact information.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900">Contact Information CMS</h2>
        <p className="text-xs text-slate-500">
          Configure official public inquiry hotlines, municipal address, office hours, and verified social media links
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Primary Office Channels
          </h3>

          <TextInput
            label="Official Central Address"
            required
            value={formData.address}
            onChange={(v) => handleChange("address", v)}
            error={errors.address}
            placeholder="Burayu MESOB Administration Building, Burayu, Oromia, Ethiopia"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Telephone Hotline (Supports 09XXXXXXXX / +251...)"
              required
              value={formData.phone}
              onChange={(v) => handleChange("phone", v)}
              error={errors.phone}
              placeholder="+251944664433"
            />

            <TextInput
              label="Official Email Address"
              required
              type="email"
              value={formData.email}
              onChange={(v) => handleChange("email", v)}
              error={errors.email}
              placeholder="mesobburayubranch@gmail.com"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Public Working Hours"
              value={formData.workingHours}
              onChange={(v) => handleChange("workingHours", v)}
              placeholder="Monday - Friday: 08:30 AM - 05:30 PM | Saturday: 08:30 AM - 12:30 PM"
            />

            <TextInput
              label="Official Web Address"
              value={formData.website}
              onChange={(v) => handleChange("website", v)}
              error={errors.website}
              placeholder="https://burayumesob.gov.et"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 space-y-5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Social Media & External Gateway
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextInput
              label="Facebook Page URL"
              value={formData.socialMedia?.facebook || ""}
              onChange={(v) => handleChange("socialMedia", v, "facebook")}
              error={errors.socialMedia_facebook}
              placeholder="https://facebook.com/..."
            />

            <TextInput
              label="Telegram Channel URL"
              value={formData.socialMedia?.telegram || ""}
              onChange={(v) => handleChange("socialMedia", v, "telegram")}
              error={errors.socialMedia_telegram}
              placeholder="https://t.me/..."
            />

            <TextInput
              label="YouTube Channel URL"
              value={formData.socialMedia?.youtube || ""}
              onChange={(v) => handleChange("socialMedia", v, "youtube")}
              placeholder="https://youtube.com/@..."
            />
          </div>

          <TextInput
            label="Shaggar E-Service Gateway URL"
            value={formData.eServiceUrl}
            onChange={(v) => handleChange("eServiceUrl", v)}
            placeholder="https://eservice.shaggarcity.et/"
            helpText="External government e-service gateway URL used across public CTA and navigation buttons."
          />
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4 text-amber-400" />
            <span>{isSubmitting ? "Saving..." : "Save Contact Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
