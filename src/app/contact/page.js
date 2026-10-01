"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/page-hero";
import SectionHeading from "@/components/section-heading";
import AccessEServiceButton, { ESERVICE_URL } from "@/components/access-eservice-button";
import { siteService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { useToast } from "@/src/context/ToastContext";
import { validateRequired, validateEmail, validatePhone } from "@/src/lib/validation";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageSquare,
  Building,
  CheckCircle2,
} from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslation();
  const toast = useToast();

  const [contactInfo, setContactInfo] = useState(null);
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

  useEffect(() => {
    setContactInfo(siteService.getContactInfo());
  }, []);

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

  const address = contactInfo?.address || "Burayu MESOB Administration Building, Burayu, Oromia, Ethiopia";
  const phone = contactInfo?.phone || "+251944664433";
  const email = contactInfo?.email || "mesobburayubranch@gmail.com";
  const workingHours = contactInfo?.workingHours || "Mon - Fri: 8:30 AM - 5:30 PM | Sat: 8:30 AM - 12:30 PM";

  const contactCards = [
    {
      icon: MapPin,
      title: t("contact.addressTitle", "Central Administration"),
      details: address,
      action: "Visit Office",
    },
    {
      icon: Phone,
      title: t("contact.phoneTitle", "Telephone Inquiries"),
      details: phone,
      action: "Call Desk",
    },
    {
      icon: Mail,
      title: t("contact.emailTitle", "Official Email"),
      details: email,
      action: "Send Email",
    },
    {
      icon: Clock,
      title: t("contact.hoursTitle", "Public Working Hours"),
      details: workingHours,
      action: "Service Schedule",
    },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Page Hero */}
      <PageHero
        eyebrow={t("contact.eyebrow", "Communication Desk")}
        title={t("contact.title", "Contact Burayu MESOB")}
        description={t(
          "contact.description",
          "Reach out to municipal departments, submit inquiries, request public service information, or connect with our communication desk."
        )}
        image=""
      />

      <div className="container-shell space-y-16">
        {/* Contact Info Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md"
              >
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    {card.details}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Form & Info Grid */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Inquiry Form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {t("contact.formTitle", "Send a Public Inquiry")}
                </h2>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("contact.name", "Full Name")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  {errors.name && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("contact.email", "Email Address")} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  {errors.email && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.email}</p>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("contact.phone", "Phone Number")}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="09XXXXXXXX or +251..."
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                  />
                  {errors.phone && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t("contact.department", "Department")}
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("contact.subject", "Subject")}
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  placeholder="Inquiry topic..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t("contact.message", "Message")} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => handleChange("message", e.target.value)}
                  placeholder="Details of your inquiry or feedback..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600"
                />
                {errors.message && <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.message}</p>}
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

          {/* Department Information & Map/Gateway */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-900">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Department Directory</h3>
                  <p className="text-xs text-slate-500">Direct contacts for specialized municipal services</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs text-slate-700">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="font-bold text-slate-900">Public Service & Civil Registration</p>
                  <p className="text-slate-500 mt-0.5">Phone: +251 11 284 0010 | Email: services@burayumesob.gov.et</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="font-bold text-slate-900">Urban Planning & Land Administration</p>
                  <p className="text-slate-500 mt-0.5">Phone: +251 11 284 0020 | Email: land@burayumesob.gov.et</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="font-bold text-slate-900">Investment Facilitation Bureau</p>
                  <p className="text-slate-500 mt-0.5">Phone: +251 11 284 0030 | Email: invest@burayumesob.gov.et</p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-800/30 bg-emerald-950 p-6 sm:p-8 text-white shadow-xl space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-amber-400">
                Online Government Gateway
              </span>
              <h3 className="text-xl font-bold">Looking to process services electronically?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Connect directly to the official Shaggar E-Service platform for permits, revenue payments, and online service applications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
