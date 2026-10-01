"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, MapPin, UserCheck } from "lucide-react";
import { eventService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { StatusBadge } from "@/components/cards";

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { t, getText } = useTranslation();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = eventService.getById(id);
      if (found && found.status === "published") {
        setItem(found);
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-shell py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-500">The requested event schedule is not currently available.</p>
        <Link href="/events" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Events</span>
        </Link>
      </div>
    );
  }

  const title = getText(item.title);
  const description = getText(item.description);
  const content = getText(item.content);

  return (
    <div className="py-12 pb-20">
      <div className="container-shell max-w-4xl space-y-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("actions.backToEvents", "Back to Events")}</span>
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-100 rounded-full px-3 py-1">
              <Calendar className="h-3.5 w-3.5" />
              {item.date}
            </span>
            {item.eventStatus && <StatusBadge status={item.eventStatus} />}
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 border-b border-slate-200 pb-4 text-xs sm:text-sm text-slate-600">
            {item.startTime && (
              <span className="flex items-center gap-2 font-medium">
                <Clock className="h-4 w-4 text-slate-400" />
                {item.startTime} {item.endTime ? `- ${item.endTime}` : ""}
              </span>
            )}
            {item.location && (
              <span className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-amber-600" />
                {item.location}
              </span>
            )}
            {item.organizer && (
              <span className="flex items-center gap-2 font-medium">
                <UserCheck className="h-4 w-4 text-slate-400" />
                {item.organizer}
              </span>
            )}
          </div>
        </div>

        {item.image && (
          <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-md">
            <img src={item.image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        {description && (
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed border-l-4 border-emerald-600 pl-4">
            {description}
          </p>
        )}

        <article className="prose prose-slate max-w-none text-base text-slate-700 leading-relaxed space-y-4">
          {content ? (
            content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p>{description}</p>
          )}
        </article>
      </div>
    </div>
  );
}
