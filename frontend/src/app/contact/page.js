"use client";

import { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { api } from "@/services/api";
import LocationMap from "@/components/LocationMap";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  ExternalLink,
} from "lucide-react";

export default function ContactPage() {
  const { t, getText } = useTranslation();
  const toast = useToast();
  const { settings } = useSiteSettings();
  const contact = settings?.contactInfo || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Address localized resolution
  const displayAddress =
    getText(contact.address) ||
    t(
      "contact.addressValue",
      "Burayu MESOB One Stop Service Building, Shaggar City, Burayu, Oromia, Ethiopia"
    );

  const displayHours =
    getText(contact.workingHours) ||
    t(
      "contact.hoursDesc",
      "Monday - Friday: 8:30 AM - 5:30 PM | Saturday: 8:30 AM - 12:30 PM"
    );

  const plusCode = "3MC5+R5M";
  const rawPhone =
    contact.phone && !contact.phone.includes("284")
      ? contact.phone
      : "+251 94 466 4433";
  const primaryPhone =
    rawPhone.replace(/\s+/g, "") === "+251944664433"
      ? "+251 94 466 4433"
      : rawPhone;
  const primaryEmail = contact.email || "mesobburayubranch@gmail.com";

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = t("contact.nameRequired", "Full Name is required.");
    }
    if (!formData.email || !formData.email.trim()) {
      errs.email = t("contact.emailRequired", "Email Address is required.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = t("contact.emailInvalid", "Please enter a valid email address.");
    }
    if (formData.phone && formData.phone.trim()) {
      if (!/^[+0-9\s\-()]{7,20}$/.test(formData.phone.trim())) {
        errs.phone = t("contact.phoneInvalid", "Please enter a valid phone number.");
      }
    }
    if (!formData.subject || !formData.subject.trim()) {
      errs.subject = t("contact.subjectRequired", "Subject is required.");
    }
    if (!formData.message || !formData.message.trim()) {
      errs.message = t("contact.messageRequired", "Message is required.");
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error(t("contact.validationToast", "Please resolve the form validation errors."));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const res = await api.post("/contact", payload);

      if (res?.success || res?.data?.success) {
        setIsSuccess(true);
        setErrorMessage("");
        toast.success(
          t(
            "contact.submitSuccess",
            "Your inquiry has been submitted successfully to Burayu MESOB!"
          )
        );
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        throw new Error(res?.message || res?.data?.message || "Failed to deliver inquiry email.");
      }
    } catch (err) {
      console.error("Contact submission error:", err);
      setIsSuccess(false);
      const serverMessage =
        err?.message ||
        err?.response?.data?.message ||
        t(
          "contact.submitError",
          "Failed to send inquiry. Please check your connection and try again."
        );
      setErrorMessage(serverMessage);
      toast.error(
        t(
          "contact.submitError",
          "Failed to send inquiry. Please check your connection and try again."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-8 sm:pt-12">
      <div className="container-shell space-y-10 sm:space-y-12">
        {/* ========================================================= */}
        {/* 1. PAGE HEADER — Clean, Single H1, Official Brand Palette */}
        {/* ========================================================= */}
        <header className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#000000]">
            {t("contact.title", "Contact Burayu MESOB")}
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-neutral-600">
            {t(
              "contact.description",
              "Get in touch with public information officers, municipal desks, and administration representatives."
            )}
          </p>
        </header>

        {/* ========================================================= */}
        {/* 2. MAIN 2-COLUMN LAYOUT: Info on One Side, Form on Other  */}
        {/* ========================================================= */}
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* ──────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: Official Contact Information (5 Cols)      */}
          {/* ──────────────────────────────────────────────────────── */}
          <aside
            aria-label="Official Contact Information"
            className="lg:col-span-5 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 shadow-xs space-y-6"
          >
            {/* Header info */}
            <div className="border-b border-neutral-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#D71920]" />
                <h2 className="text-xl font-black text-[#000000] tracking-tight">
                  {t("contact.infoTitle", "Official Contact Details")}
                </h2>
              </div>
              <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                {t(
                  "contact.infoSubtitle",
                  "Direct communication channels to the Burayu MESOB Branch administration."
                )}
              </p>
            </div>

            {/* Official Details List */}
            <div className="space-y-5 text-xs sm:text-sm">
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D71920]/10 text-[#D71920]">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-neutral-500">
                    {t("contact.addressTitle", "Office Location")}
                  </p>
                  <p className="font-semibold text-[#000000] leading-snug">
                    {displayAddress}
                  </p>
                </div>
              </div>

              {/* Telephone */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D71920]/10 text-[#D71920]">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-neutral-500">
                    {t("contact.phoneTitle", "Phone")}
                  </p>
                  <div>
                    <a
                      href={`tel:${primaryPhone.replace(/\s+/g, "")}`}
                      className="font-bold text-[#000000] hover:text-[#D71920] transition-colors"
                    >
                      {primaryPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D71920]/10 text-[#D71920]">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-neutral-500">
                    {t("contact.emailTitle", "Email")}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    <a
                      href={`mailto:${primaryEmail}`}
                      className="font-bold text-[#000000] hover:text-[#D71920] transition-colors break-all"
                    >
                      {primaryEmail}
                    </a>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D71920]/10 text-[#D71920]">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-neutral-500">
                    {t("contact.hoursTitle", "Working Hours")}
                  </p>
                  <p className="font-semibold text-[#000000] leading-snug">
                    {displayHours}
                  </p>
                </div>
              </div>
            </div>

          </aside>

          {/* ──────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: Official Public Inquiry Form (7 Cols)      */}
          {/* ──────────────────────────────────────────────────────── */}
          <section
            aria-labelledby="form-heading"
            className="lg:col-span-7 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-10 shadow-xs space-y-6"
          >
            {/* Form Heading */}
            <h2
              id="form-heading"
              className="text-xl sm:text-2xl font-black text-[#000000] tracking-tight"
            >
              {t("contact.formTitle", "Send an Inquiry")}
            </h2>

            {/* Success Feedback Banner */}
            {isSuccess && (
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 space-y-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-[#000000]">
                  <CheckCircle2 className="h-5 w-5 text-[#D71920] shrink-0" />
                  <h3 className="text-sm font-bold">
                    {t("contact.successTitle", "Inquiry Submitted Successfully!")}
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed pl-8">
                  {t(
                    "contact.successMsg",
                    "Thank you for contacting Burayu MESOB. Your message has been logged in our queue and will receive prompt attention."
                  )}
                </p>
                <div className="pl-8 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsSuccess(false)}
                    className="text-xs font-bold text-[#D71920] hover:underline"
                  >
                    {t("contact.sendAnother", "Send Another Message")}
                  </button>
                </div>
              </div>
            )}

            {/* Error Feedback Banner */}
            {errorMessage && !isSuccess && (
              <div className="rounded-2xl border border-[#D71920]/25 bg-[#D71920]/5 p-5 space-y-2 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 text-[#D71920]">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <h3 className="text-sm font-bold">
                    {t("contact.submitErrorTitle", "Submission Notice")}
                  </h3>
                </div>
                <p className="text-xs text-neutral-700 leading-relaxed pl-8">
                  {errorMessage}
                </p>
              </div>
            )}

            {/* Inquiry Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Row 1: Name & Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-bold text-[#000000] mb-1.5"
                  >
                    {t("contact.fullName", "Full Name")}{" "}
                    <span className="text-[#D71920]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={formData.name}
                    placeholder={t("contact.namePlaceholder", "e.g., Abebe Bikila")}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-[#000000] placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-[#D71920] focus:ring-[#D71920]/20"
                        : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-[11px] font-bold text-[#D71920]">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-bold text-[#000000] mb-1.5"
                  >
                    {t("contact.email", "Email Address")}{" "}
                    <span className="text-[#D71920]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    placeholder={t("contact.emailPlaceholder", "name@example.com")}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-[#000000] placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-[#D71920] focus:ring-[#D71920]/20"
                        : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-[11px] font-bold text-[#D71920]">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone Number (optional) */}
              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-xs font-bold text-[#000000] mb-1.5"
                >
                  {t("contact.phone", "Phone Number")}
                </label>
                <input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  placeholder={t("contact.phonePlaceholder", "+251 9... / 09...")}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-[#000000] placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? "border-[#D71920] focus:ring-[#D71920]/20"
                      : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-[11px] font-bold text-[#D71920]">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-bold text-[#000000] mb-1.5"
                >
                  {t("contact.subject", "Subject")}{" "}
                  <span className="text-[#D71920]">*</span>
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  placeholder={t(
                    "contact.subjectPlaceholder",
                    "e.g., Service query or public feedback"
                  )}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-[#000000] placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.subject
                      ? "border-[#D71920] focus:ring-[#D71920]/20"
                      : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
                  }`}
                />
                {errors.subject && (
                  <p className="mt-1 text-[11px] font-bold text-[#D71920]">
                    {errors.subject}
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-bold text-[#000000] mb-1.5"
                >
                  {t("contact.message", "Message")}{" "}
                  <span className="text-[#D71920]">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  required
                  value={formData.message}
                  placeholder={t(
                    "contact.messagePlaceholder",
                    "Write your detailed inquiry or message here..."
                  )}
                  onChange={(e) => handleChange("message", e.target.value)}
                  className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-xs text-[#000000] placeholder-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
                    errors.message
                      ? "border-[#D71920] focus:ring-[#D71920]/20"
                      : "border-neutral-200 focus:border-[#D71920] focus:ring-[#D71920]/15"
                  }`}
                />
                {errors.message && (
                  <p className="mt-1 text-[11px] font-bold text-[#D71920]">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#D71920] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-[#b5141a] hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>{t("contact.submitting", "Submitting...")}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{t("contact.submit", "SEND INQUIRY")}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* ========================================================= */}
        {/* 3. INTERACTIVE MAP SECTION BELOW (Clean, Non-Redundant)   */}
        {/* ========================================================= */}
        <section aria-labelledby="map-heading" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
            <div>
              <h2
                id="map-heading"
                className="text-xl sm:text-2xl font-black text-[#000000] tracking-tight"
              >
                {t("contact.mapSectionTitle", "Find Us on the Map")}
              </h2>
              <p className="text-xs text-neutral-600">
                {t(
                  "contact.mapSectionDesc",
                  "Official verified location of Burayu MESOB One Stop Service Center."
                )}
              </p>
            </div>
          </div>

          <LocationMap
            mapOnly={true}
            address={displayAddress}
            phone={primaryPhone}
            email={primaryEmail}
            workingHours={displayHours}
            plusCode={plusCode}
          />
        </section>
      </div>
    </div>
  );
}
