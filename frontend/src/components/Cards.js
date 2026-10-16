"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, MapPin, Tag, Building2, BriefcaseBusiness, MapPinned, FileText, Banknote, Users, Play, Video, Layers } from "lucide-react";
import AccessEServiceButton from "@/components/AccessEserviceButton";
import { useTranslation } from "@/src/context/LanguageContext";

export function StatusBadge({ status }) {
  const { t } = useTranslation();

  const statusStyles = {
    Ongoing: "bg-[#070707] text-white border-[#070707]",
    Planned: "bg-white text-[#070707] border-slate-300",
    Pilot: "bg-white text-[#070707] border-slate-300",
    Completed: "bg-slate-100 text-[#070707] border-slate-300",
    Upcoming: "bg-[#FE0002]/10 text-[#FE0002] border-[#FE0002]/30",
    published: "bg-[#070707] text-white border-[#070707]",
    draft: "bg-slate-100 text-slate-600 border-slate-300",
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
        statusStyles[status] || "bg-neutral-100 text-[#070707] border-neutral-200"
      }`}
    >
      {displayLabel}
    </span>
  );
}

import { getImageUrl } from "@/src/lib/imageUrl";

export function NewsCard({ item }) {
  const { getText, t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const videoRef = useRef(null);

  const title = getText(item.title);
  const summary = getText(item.summary || item.description);

  const rawVideo = item.video && typeof item.video === "string" ? item.video.trim() : "";
  const videoUrl = rawVideo
    ? rawVideo.startsWith("http") || rawVideo.startsWith("/")
      ? rawVideo
      : `/${rawVideo}`
    : "";

  const imageUrl = getImageUrl(item.image);

  const handlePlay = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current
                .play()
                .then(() => setIsPlaying(true))
                .catch(() => {});
            }
          });
      } else {
        setIsPlaying(true);
      }
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/30">
      {/* Media section: Video preview or standard Image */}
      {videoUrl ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950 group/media">
          <video
            ref={videoRef}
            src={videoUrl}
            poster={imageUrl || undefined}
            preload="none"
            playsInline
            controls={isPlaying}
            controlsList="nodownload"
            className="h-full w-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => {}}
            onEnded={() => setIsPlaying(false)}
          >
            Your browser does not support the video tag.
          </video>

          {!isPlaying && (
            <>
              {item.category && (
                <span className="pointer-events-none absolute top-3 left-3 z-10 rounded-full bg-[#FE0002] px-3 py-1 text-[11px] font-bold text-white shadow-xs border border-white/20">
                  {item.category}
                </span>
              )}

              <span className="pointer-events-none absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs border border-white/10">
                <Video className="h-3 w-3 text-white" />
                <span>Video</span>
              </span>

              <button
                type="button"
                onClick={handlePlay}
                aria-label="Play video"
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 transition-all duration-300 hover:bg-black/35 group/play cursor-pointer"
              >
                <span className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-[#FE0002] text-white shadow-xl shadow-black/40 ring-4 ring-white/30 transition-transform duration-300 group-hover/play:scale-110 group-active/play:scale-95">
                  <Play className="h-6 w-6 fill-white translate-x-0.5" />
                </span>
              </button>
            </>
          )}
        </div>
      ) : imageUrl && !imgError ? (
        <Link href={`/news/${item.id}`} className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 block">
          <Image
            src={imageUrl}
            alt={title || "News"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            quality={75}
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
          {item.category && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-[#FE0002] px-3 py-1 text-[11px] font-bold text-white shadow-xs border border-white/20">
              {item.category}
            </span>
          )}
        </Link>
      ) : (
        <Link href={`/news/${item.id}`} className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 transition block">
          <FileText className="h-10 w-10 text-slate-300 transition-transform group-hover:scale-105" />
          {item.category && (
            <span className="absolute top-3 left-3 z-10 rounded-full bg-[#FE0002] px-3 py-1 text-[11px] font-bold text-white shadow-xs border border-white/20">
              {item.category}
            </span>
          )}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500">
          <Calendar className="h-3.5 w-3.5 text-[#FE0002]" />
          <span>{item.date}</span>
        </div>

        <h3 className="mt-3 text-base sm:text-lg font-bold text-[#070707] group-hover:text-[#FE0002] transition line-clamp-2">
          <Link href={`/news/${item.id}`}>{title}</Link>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3 flex-1">
          {summary}
        </p>

        <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-between">
          <Link
            href={`/news/${item.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FE0002] transition hover:text-[#CC0002]"
            aria-label={`${t("actions.readMore", "Read More")}: ${title}`}
          >
            <span>{t("actions.readMore", "Read More")}</span>
            <span className="sr-only">: {title}</span>
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AnnouncementCard({ item }) {
  const { getText, t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const title = getText(item.title);
  const summary = getText(item.summary || item.description);
  const imageUrl = getImageUrl(item.image);

  return (
    <div className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FE0002]/30 hover:shadow-md">
      {imageUrl && !imgError ? (
        <Link href={`/announcements/${item.id}`} className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 block">
          <Image
            src={imageUrl}
            alt={title || "Announcement"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            quality={75}
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
          <span className="absolute top-3 left-3 z-10 rounded-full bg-[#FE0002] px-3 py-1 text-[11px] font-bold text-white shadow-xs border border-white/20">
            {item.category || "Public Notice"}
          </span>
        </Link>
      ) : (
        <Link href={`/announcements/${item.id}`} className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100/60 flex flex-col items-center justify-center text-amber-700/60 group-hover:text-amber-800 transition block border-b border-amber-100">
          <FileText className="h-10 w-10 text-amber-400/80 transition-transform group-hover:scale-105" />
          <span className="absolute top-3 left-3 z-10 rounded-full bg-[#FE0002] px-3 py-1 text-[11px] font-bold text-white shadow-xs border border-white/20">
            {item.category || "Public Notice"}
          </span>
        </Link>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center rounded-full bg-[#FE0002]/10 border border-[#FE0002]/25 px-3 py-1 text-[11px] font-bold text-[#FE0002]">
              {item.category || "Public Notice"}
            </span>
            <span className="text-xs font-medium text-neutral-500">{item.date}</span>
          </div>

          <h3 className="mt-4 text-base sm:text-lg font-bold text-[#070707] group-hover:text-[#FE0002] transition">
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
            className="inline-flex items-center gap-1 text-xs font-bold text-[#FE0002] hover:text-[#CC0002] shrink-0 transition"
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
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FE0002]/30 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center rounded-full bg-[#FE0002]/10 border border-[#FE0002]/25 px-3 py-1 text-[11px] font-bold text-[#FE0002]">
            {item.category || "Notice"}
          </span>
          <span className="text-xs font-medium text-neutral-500">{item.date}</span>
        </div>

        <h3 className="mt-4 text-base sm:text-lg font-bold text-[#070707] hover:text-[#FE0002] transition">
          <Link href={`/notices/${item.id}`}>
            {title}
          </Link>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3">
          {summary}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
        <span className="font-mono text-[11px] font-semibold text-[#070707]">{item.referenceNo}</span>
        <Link
          href={`/notices/${item.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#FE0002] hover:text-[#CC0002] transition"
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
  const [imgError, setImgError] = useState(false);
  const title = getText(item.title);
  const description = getText(item.description);
  const imageUrl = getImageUrl(item.image);

  return (
    <article className="group flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/30">
      {imageUrl && !imgError ? (
        <Link href={`/events/${item.id}`} className="relative sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden bg-neutral-100 shrink-0 min-h-[160px] block">
          <Image
            src={imageUrl}
            alt={title || "Event"}
            fill
            sizes="(max-width: 640px) 100vw, 40vw"
            loading="lazy"
            quality={75}
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
        </Link>
      ) : (
        <Link href={`/events/${item.id}`} className="relative sm:w-2/5 aspect-[16/10] sm:aspect-auto overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shrink-0 min-h-[160px] flex items-center justify-center text-slate-400 group-hover:text-slate-600 transition block">
          <Calendar className="h-10 w-10 text-slate-300 transition-transform group-hover:scale-105" />
        </Link>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FE0002]">
            <Calendar className="h-3.5 w-3.5" /> {item.date}
          </span>
          {item.eventStatus ? <StatusBadge status={item.eventStatus} /> : null}
        </div>

        <h3 className="mt-3 text-base sm:text-lg font-bold text-[#070707] group-hover:text-[#FE0002] transition">
          <Link href={`/events/${item.id}`}>{title}</Link>
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
          <MapPin className="h-3.5 w-3.5 text-[#FE0002] shrink-0" />
          <span className="truncate">{item.location}</span>
        </div>

        <p className="mt-3 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        <div className="mt-4 pt-3 border-t border-neutral-100">
          <Link
            href={`/events/${item.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FE0002] transition hover:text-[#CC0002]"
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
  const [imgError, setImgError] = useState(false);
  const title = getText(item.title);
  const description = getText(item.description);
  const progress = Math.min(100, Math.max(0, Number(item.progress) || 0));
  const imageUrl = getImageUrl(item.image);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/30">
      {imageUrl && !imgError ? (
        <Link href={`/projects/${item.id}`} className="relative aspect-[16/9] w-full overflow-hidden bg-neutral-100 block">
          <Image
            src={imageUrl}
            alt={title || "Project"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
            quality={75}
            onError={() => setImgError(true)}
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          />
          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={item.projectStatus || item.status} />
          </div>
        </Link>
      ) : (
        <Link href={`/projects/${item.id}`} className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-600 transition block border-b border-neutral-100">
          <Building2 className="h-10 w-10 text-slate-300 transition-transform group-hover:scale-105" />
          <div className="absolute top-3 left-3 z-10">
            <span className="rounded-full bg-slate-900/80 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white">
              {item.department || item.category || "Infrastructure"}
            </span>
          </div>
          <div className="absolute top-3 right-3 z-10">
            <StatusBadge status={item.projectStatus || item.status} />
          </div>
        </Link>
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-xs font-medium text-neutral-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="h-3.5 w-3.5 text-[#FE0002] shrink-0" />
            <span className="truncate">{item.location || "Burayu"}</span>
          </div>
          <span className="text-[11px] font-bold text-neutral-400">
            {item.department || item.category}
          </span>
        </div>

        <h3 className="mt-2 text-base sm:text-lg font-bold text-[#070707] group-hover:text-[#FE0002] transition">
          <Link href={`/projects/${item.id}`}>{title}</Link>
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed line-clamp-3 flex-1">
          {description}
        </p>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500 font-medium">Progress</span>
            <span className="font-bold text-[#070707]">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#070707] transition-all duration-300"
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
            className="inline-flex items-center gap-1.5 rounded-full bg-[#FE0002] hover:bg-[#CC0002] hover:shadow-md hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98] px-4 py-1.5 text-xs font-bold text-white transition-all duration-200 shadow-xs"
          >
            <span>{t("actions.viewProject", "View Project")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FloorCard({ item }) {
  const { getText, language } = useTranslation();
  const [imageError, setImageError] = useState(false);

  // Safely parse multilingual name
  let nameField = item.name;
  if (typeof nameField === "string" && (nameField.startsWith("{") || nameField.startsWith("["))) {
    try {
      nameField = JSON.parse(nameField);
    } catch {}
  }
  const floorName =
    typeof nameField === "object" && nameField !== null
      ? (getText(nameField) || nameField[language] || nameField.om || nameField.en || nameField.am || "")
      : String(item.name || item.title || "");

  // Safely parse multilingual description
  let descField = item.description;
  if (typeof descField === "string" && (descField.startsWith("{") || descField.startsWith("["))) {
    try {
      descField = JSON.parse(descField);
    } catch {}
  }
  const description =
    typeof descField === "object" && descField !== null
      ? (getText(descField) || descField[language] || descField.om || descField.en || descField.am || "")
      : String(item.description || "");

  const imageUrl = getImageUrl(item.image);
  const primaryAnchor = item.floorNumber ? `floor-${item.floorNumber}` : `floor-${item.id}`;
  const secondaryAnchor = item.id && item.floorNumber && String(item.id) !== String(item.floorNumber) ? `floor-${item.id}` : null;

  return (
    <article
      id={primaryAnchor}
      className="scroll-mt-28 relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#FE0002]/40 hover:shadow-md target:ring-2 target:ring-[#FE0002] target:border-[#FE0002] target:shadow-xl group"
    >
      {secondaryAnchor && (
        <span id={secondaryAnchor} className="scroll-mt-28 absolute -top-28 pointer-events-none" />
      )}

      {/* Floor Image */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100 border-b border-neutral-100">
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={floorName || "Floor"}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 to-neutral-900 text-white">
            <Building2 className="h-10 w-10 text-white/30" />
          </div>
        )}
      </div>

      {/* Floor Name & Description */}
      <div className="flex flex-1 flex-col p-6 sm:p-7 justify-between gap-3">
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-[#070707] group-hover:text-[#FE0002] transition-colors leading-snug">
            {floorName || "Untitled Floor"}
          </h3>

          <p className="text-xs sm:text-sm leading-relaxed text-neutral-600 font-normal whitespace-pre-line">
            {description || "No description provided."}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ServiceCard({ item }) {
  const { getText } = useTranslation();
  const title = getText(item.title);
  const description = getText(item.description);

  const iconMap = {
    Building2,
    BriefcaseBusiness,
    MapPinned,
    FileText,
    Banknote,
    Users,
  };

  const Icon = typeof item.icon === "string" ? iconMap[item.icon] || Building2 : item.icon || Building2;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-6 sm:p-7 shadow-xs transition hover:border-[#FE0002]/40 hover:shadow-md group">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#070707] text-white shadow-xs group-hover:bg-[#FE0002] transition-colors">
          <Icon className="h-6 w-6" />
        </div>
        {item.category && (
          <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 text-slate-700 px-3 py-1 text-xs font-bold">
            {item.category}
          </span>
        )}
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#070707] group-hover:text-[#FE0002] transition-colors">
        {title}
      </h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600 font-normal flex-1">
        {description}
      </p>
    </div>
  );
}

export function InvestmentCard({ item }) {
  const Icon = item.icon || Building2;
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#FE0002]/30 group">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#070707] text-white shadow-xs transition-colors group-hover:bg-[#FE0002]">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-lg font-bold text-[#070707]">{item.title}</h3>
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-neutral-600 flex-1">{item.description}</p>

      {item.details ? (
        <p className="mt-4 rounded-xl bg-[#F9FAFB] p-3.5 text-xs text-[#070707] font-normal border border-neutral-200">
          {item.details}
        </p>
      ) : null}
    </div>
  );
}
