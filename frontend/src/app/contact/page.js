"use client";

import { useState } from "react";
import LocationMap from "@/components/LocationMap";
import { useTranslation } from "@/src/context/LanguageContext";
import { useToast } from "@/src/context/ToastContext";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";
import { validateRequired, validateEmail, validatePhone } from "@/src/lib/validation";
import { Send, MessageSquare, CheckCircle2, MapPin } from "lucide-react";

export default function ContactPage() {
  const { t, getText } = useTranslation();
  const toast = useToast();
  const { settings } = useSiteSettings();
  const contact = settings?.contactInfo || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "General Inquiries",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newErrors = {};

    const nameErr = validateRequired(formData.name, "Full Name");
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email, true);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.phone, false);
    if (phoneErr) newErrors.phone = phoneErr;

    const msgErr = validateRequired(formData.message, "Message");
    if (msgErr) newErrors.message = msgErr;

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setIsSubmitting(false);
      toast.error("Please resolve form validation errors.");
      return;
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Your inquiry has been submitted successfully to Burayu MESOB!");
      setFormData({
        name: "",
        email: "",
        phone: "",
        department: "General Inquiries",
        subject: "",
        message: "",
      });
    }, 600);
  };

  return (
    <div className="space-y-16 pb-16">
      <div className="container-shell space-y-16 pt-12">
        {/* ============================================== */}
        {/* FIRST SECTION — Our Location                   */}
        {/* ============================================== */}
        <section id="our-location" className="space-y-8">
          <div className="max-w-2xl relative">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FE0002]">
              {t("contact.locationEyebrow", "Find Us In Person")}
            </p>
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#070707] sm:text-3xl lg:text-4xl">
              {t("contact.locationTitle", "Our Location")}
            </h2>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-neutral-600">
              {t(
                "contact.locationDescription",
                "Visit the Burayu MESOB One Stop Service Building. Office directions, plus code, and a live map are provided below."
              )}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-base font-bold text-[#070707]">
              {getText(contact.address) || "Burayu MESOB One Stop Service Building"}
            </p>
            <p className="text-sm text-neutral-600">{t("locationMap.cityRegion", "Burayu, Oromia, Ethiopia")}</p>
            {contact.phone && (
              <p className="text-sm text-neutral-600">{contact.phone}</p>
            )}
            {contact.email && (
              <p className="text-sm text-neutral-600">{contact.email}</p>
            )}
            {contact.workingHours && (
              <p className="text-sm text-neutral-600">{getText(contact.workingHours)}</p>
            )}
            <p className="text-sm text-neutral-600 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#FE0002]" />
              Plus Code: <strong className="text-[#070707]">3MC5+R5M</strong>
            </p>
          </div>

          <LocationMap
            address={contact.address}
            phone={contact.phone}
            email={contact.email}
            workingHours={contact.workingHours}
          />
        </section>

        {/* ============================================== */}
        {/* SECOND SECTION — Send an Inquiry               */}
        {/* ============================================== */}
        <section id="send-inquiry" className="space-y-8">
          <div className="max-w-2xl relative">
            <h2 className="mt-1 text-2xl font-black tracking-tight text-[#070707] sm:text-3xl lg:text-4xl">
              {t("contact.formTitle", "Send an Inquiry")}
            </h2>
            <p className="mt-2 text-sm sm:text-base leading-relaxed text-neutral-600">
              {t("contact.formDescription", "Official inquiries are routed to appropriate departments.")}
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs max-w-4xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#070707]">
                  {t("contact.formTitle", "Send an Inquiry")}
                </h3>
                <p className="text-xs text-slate-500">Official inquiries are routed to appropriate departments</p>
              </div>
            </div>

            {isSuccess && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <span>Thank you! Your message has been recorded. Our communications bureau will respond promptly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#070707] mb-1">
                    {t("contact.name", "Full Name")} <span className="text-[#FE0002]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  {errors.name && <p className="mt-1 text-[11px] font-bold text-[#FE0002]">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#070707] mb-1">
                    {t("contact.email", "Email Address")} <span className="text-[#FE0002]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  {errors.email && <p className="mt-1 text-[11px] font-bold text-[#FE0002]">{errors.email}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#070707] mb-1">
                    {t("contact.phone", "Phone Number")}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  {errors.phone && <p className="mt-1 text-[11px] font-bold text-[#FE0002]">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#070707] mb-1">
                    {t("contact.department", "Department")}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="General Inquiries">General Inquiries</option>
                    <option value="Public Services Desk">Public Services Desk</option>
                    <option value="Urban Planning & Land">Urban Planning & Land</option>
                    <option value="Investment Bureau">Investment Bureau</option>
                    <option value="Mayor / Administrator Desk">Administrator Desk</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#070707] mb-1">
                  {t("contact.subject", "Subject")}
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#070707] mb-1">
                  {t("contact.message", "Message")} <span className="text-[#FE0002]">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-[#070707] focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                {errors.message && <p className="mt-1 text-[11px] font-bold text-[#FE0002]">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 py-3 text-xs font-bold text-white transition hover:bg-slate-800 shadow-md disabled:opacity-50"
              >
                <Send className="h-4 w-4 text-amber-400" />
                <span>{isSubmitting ? "Submitting..." : t("contact.submit", "Submit Public Inquiry")}</span>
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
