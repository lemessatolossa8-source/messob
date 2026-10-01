"use client";

import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Tag, Building2, BriefcaseBusiness, MapPinned, FileText, Banknote, Users } from "lucide-react";
import AccessEServiceButton from "@/components/access-eservice-button";
import { useTranslation } from "@/src/context/LanguageContext";

export function StatusBadge({ status }) {
  const { t } = useTranslation();

  const statusStyles = {
    Ongoing: "bg-[#176B3A]/10 text-[#176B3A] border-[#176B3A]/30",
    Planned: "bg-amber-50 text-amber-700 border-amber-300",
    Pilot: "bg-[#0F5132]/10 text-[#0F5132] border-[#0F5132]/30",
    Completed: "bg-neutral-100 text-neutral-800 border-neutral-300",
    Upcoming: "bg-[#B32025]/10 text-[#B32025] border-[#B32025]/30",
    published: "bg-[#176B3A]/10 text-[#176B3A] border-[#176B3A]/30",
    draft: "bg-neutral-100 text-neutral-600 border-neutral-300",
  };

  const statusLabels = {
    Ongoing: t("projects.statusOngoing", "Ongoing"),
    Planned: t("projects.statusPlanned", "Planned"),
    Completed: t("projects.statusCompleted", "Completed"),
    Upcoming: t("events.statusUpcoming", "Upcoming"),
    published: t("admin.status.published", "Published"),
    draft: t("admin.status.draft", "Draft"),
  };

  const displayLabel = statusLabels[status] || status;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-bold ${
        statusStyles[status] || "bg-neutral-100 text-neutral-700 border-neutral-200"
      }`}
    >
      {displayLabel}
    </span>
  );
}

export function NewsCard({ item }) {
  const { getText, t } = useTranslation();
  const title = getText(item.title);
  const summary = getText(item.summary || item.description);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition hover:shadow-md hover:border-[#176B3A]/50">
      {item.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <img
            src={item.image}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute top-3 left-3 rounded-full bg-[#0F5132] px-3 py-1 text-[11px] font-bold text-white shadow-xs border border-white/20">
            {item.category}
          </span>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Calendar className="h-3.5 w-3.5 text-[#176B3A]" />
          <span>{item.date}</span>
        </div>

        <h3 className="mt-3 text-base sm:text-lg font-bold text-[#17221B] group-hover:text-[#176B3A] transition line-clamp-2">
          <Link href={`/news/${item.id}`}>{title}</Link>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3 flex-1">
          {summary}
        </p>

        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <Link
            href={`/news/${item.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B3A] transition hover:text-[#0F5132]"
          >
            <span>{t("actions.readMore", "Read More")}</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AnnouncementCard({ item }) {
  const { getText, t } = useTranslation();
  const title = getText(item.title);
  const summary = getText(item.summary || item.description);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition hover:border-[#176B3A]/60 hover:shadow-md">
      {item.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <img
            src={item.image}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center rounded-full bg-[#176B3A]/10 border border-[#176B3A]/25 px-3 py-1 text-[11px] font-bold text-[#176B3A]">
              {item.category || "Public Notice"}
            </span>
            <span className="text-xs font-medium text-neutral-500">{item.date}</span>
          </div>

          <h3 className="mt-4 text-base sm:text-lg font-bold text-[#17221B] group-hover:text-[#176B3A] transition">
            <Link href={`/announcements/${item.id}`}>
              {title}
            </Link>
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3">
            {summary}
          </p>
        </div>

        <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
          <span className="truncate pr-2 font-medium">{item.department || "Burayu MESOB"}</span>
          <Link
            href={`/announcements/${item.id}`}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#176B3A] hover:text-[#0F5132] shrink-0"
          >
            <span>{t("actions.viewNotice", "View Notice")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function NoticeCard({ item }) {
  const { getText, t } = useTranslation();
  const title = getText(item.title);
  const summary = getText(item.summary || item.description);

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition hover:border-[#176B3A]/60 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center rounded-full bg-[#B32025]/10 border border-[#B32025]/25 px-3 py-1 text-[11px] font-bold text-[#B32025]">
            {item.category || "Notice"}
          </span>
          <span className="text-xs font-medium text-neutral-500">{item.date}</span>
        </div>

        <h3 className="mt-4 text-base sm:text-lg font-bold text-[#17221B] hover:text-[#176B3A] transition">
          <Link href={`/notices/${item.id}`}>
            {title}
          </Link>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3">
          {summary}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-mono text-[11px] font-semibold text-[#17221B]">{item.referenceNo}</span>
        <Link
          href={`/notices/${item.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#176B3A] hover:text-[#0F5132]"
        >
          <span>{t("actions.viewNotice", "View Notice")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

export function EventCard({ item }) {
  const { getText, t } = useTranslation();
  const title = getText(item.title);
  const description = getText(item.description);

  return (
    <article className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition hover:shadow-md hover:border-[#176B3A]/50">
      {item.image ? (
        <div className="relative sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden bg-neutral-100 shrink-0">
          <img
            src={item.image}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B3A]">
            <Calendar className="h-3.5 w-3.5" /> {item.date}
          </span>
          {item.eventStatus ? <StatusBadge status={item.eventStatus} /> : null}
        </div>

        <h3 className="mt-3 text-base sm:text-lg font-bold text-[#17221B] group-hover:text-[#176B3A] transition">
          <Link href={`/events/${item.id}`}>{title}</Link>
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <MapPin className="h-3.5 w-3.5 text-[#176B3A] shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        <div className="mt-4 pt-3 border-t border-neutral-100">
          <Link
            href={`/events/${item.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#176B3A] transition hover:text-[#0F5132]"
          >
            <span>{t("actions.viewDetails", "View Details")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ProjectCard({ item }) {
  const { getText, t } = useTranslation();
  const title = getText(item.title);
  const description = getText(item.description);
  const progress = Math.min(100, Math.max(0, Number(item.progress) || 0));

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-xs transition hover:shadow-md hover:border-[#176B3A]/60">
      {item.image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100">
          <img src={item.image} alt={title} className="h-full w-full object-cover" />
          <div className="absolute top-3 right-3">
            <StatusBadge status={item.projectStatus || item.status} />
          </div>
        </div>
      ) : (
        <div className="p-4 bg-[#F5F7F6] border-b border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            {item.department || item.category || "Infrastructure"}
          </span>
          <StatusBadge status={item.projectStatus || item.status} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-[#176B3A] shrink-0" />
            <span className="truncate">{item.location || "Burayu"}</span>
          </div>
          <span className="text-[11px] font-bold text-neutral-400">
            {item.department || item.category}
          </span>
        </div>

        <h3 className="mt-2 text-base sm:text-lg font-bold text-[#17221B] hover:text-[#176B3A] transition">
          <Link href={`/projects/${item.id}`}>{title}</Link>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">Progress</span>
            <span className="font-bold text-[#17221B]">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#176B3A] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500 font-medium">
            {item.start_date || item.startDate ? `${item.start_date || item.startDate}` : ""}
          </span>
          <Link
            href={`/projects/${item.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#176B3A] hover:bg-[#0F5132] px-4 py-1.5 text-xs font-bold text-white transition active:scale-[0.98] shadow-xs"
          >
            <span>{t("actions.viewProject", "View Project")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServiceCard({ item }) {
  const { getText, language, t } = useTranslation();
  const title = getText(item.title);
  const description = getText(item.description);
  const counterNo = item.counterNo || item.counter || "Counter 03";
  const department = item.department ? getText(item.department) : "Burayu MESOB Department";
  const staff = item.staff ? getText(item.staff) : "Official Staff Desk";

  const iconMap = {
    Building2,
    BriefcaseBusiness,
    MapPinned,
    FileText,
    Banknote,
    Users,
  };

  const Icon = typeof item.icon === "string" ? iconMap[item.icon] || Building2 : item.icon || Building2;

  // Resolve bullet list
  let bulletList = [];
  if (item.servicesList) {
    if (Array.isArray(item.servicesList)) {
      bulletList = item.servicesList;
    } else if (typeof item.servicesList === "object") {
      bulletList = item.servicesList[language] || item.servicesList.om || item.servicesList.en || [];
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs transition hover:border-[#176B3A]/60 hover:shadow-md group">
      {item.image ? (
        <div className="relative aspect-[16/9] -mx-6 -mt-6 sm:-mx-7 sm:-mt-7 mb-5 overflow-hidden bg-neutral-100 border-b border-neutral-100">
          <img
            src={item.image}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 rounded-full bg-[#0F5132]/95 text-white font-bold text-[10px] px-3 py-1 shadow-sm border border-white/20 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#176B3A]" />
            <span>🏢 Physical Service</span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#176B3A]/10 text-[#176B3A] shadow-xs">
          <Icon className="h-6 w-6" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F7F6] border border-neutral-200 text-[#17221B] px-3 py-1 text-xs font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-[#176B3A]" />
          <span>📍 {counterNo}</span>
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#17221B] group-hover:text-[#176B3A] transition">{title}</h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600 font-normal flex-1">{description}</p>

      {/* Counter, Department & Staff metadata box */}
      <div className="mt-4 rounded-xl bg-[#F5F7F6] border border-neutral-200/80 p-3.5 space-y-1.5 text-xs text-neutral-700">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-500 uppercase text-[10px]">Counter Office</span>
          <span className="font-bold text-[#17221B]">{counterNo}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-500 uppercase text-[10px]">Department</span>
          <span className="font-medium text-neutral-800 truncate max-w-[180px]">{department}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-neutral-500 uppercase text-[10px]">Duty Staff</span>
          <span className="font-medium text-neutral-800 truncate max-w-[180px]">{staff}</span>
        </div>
      </div>

      {bulletList.length > 0 ? (
        <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
          {bulletList.slice(0, 3).map((svc, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-700 font-normal">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#176B3A] shrink-0" />
              <span className="line-clamp-1">{svc}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
        <Link
          href={`/services#${item.id || "service"}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#176B3A] hover:bg-[#0F5132] text-white font-bold text-xs py-3 px-4 shadow-sm transition active:scale-[0.98]"
        >
          <span>View Service Details</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function InvestmentCard({ item }) {
  const Icon = item.icon || Building2;
  return (
    <div className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-xs transition hover:shadow-md hover:border-[#176B3A]/60">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#176B3A]/10 text-[#176B3A] shadow-xs">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#17221B]">{item.title}</h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600 flex-1">{item.description}</p>

      {item.details ? (
        <p className="mt-4 rounded-xl bg-[#F5F7F6] p-3.5 text-xs text-neutral-700 font-normal border border-neutral-200">
          {item.details}
        </p>
      ) : null}
    </div>
  );
}
