"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { announcementService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { AnnouncementCard } from "@/components/cards";

export default function AnnouncementDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { t, getText } = useTranslation();

  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = announcementService.getById(id);
      if (found && found.status === "published") {
        setItem(found);
        const all = announcementService.getAll({ status: "published" }).items;
        setRelated(all.filter((n) => n.id !== id).slice(0, 3));
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
        <h2 className="text-2xl font-bold text-slate-900">Announcement Not Found</h2>
        <p className="text-xs text-slate-500">The requested announcement is not available.</p>
        <Link href="/announcements" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Announcements</span>
        </Link>
      </div>
    );
  }

  const title = getText(item.title);
  const summary = getText(item.summary || item.description);
  const content = getText(item.content);

  return (
    <div className="py-12 pb-20">
      <div className="container-shell max-w-4xl space-y-8">
        <Link
          href="/announcements"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("actions.backToAnnouncements", "Back to Announcements")}</span>
        </Link>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-900">
              {item.category || "Public Notice"}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              {item.date}
            </span>
            {item.referenceNo && (
              <span className="font-mono text-xs text-slate-400 bg-slate-100 rounded-md px-2 py-0.5">
                {item.referenceNo}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
            {title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-slate-500 border-b border-slate-200 pb-4 font-medium">
            <span>Department:</span>
            <span className="font-bold text-slate-700">{item.department || "Office of the Administrator"}</span>
          </div>
        </div>

        {item.image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-md">
            <img
              src={item.image}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {summary && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 text-sm sm:text-base font-medium text-slate-800 leading-relaxed">
            {summary}
          </div>
        )}

        <article className="prose prose-slate max-w-none text-base text-slate-700 leading-relaxed space-y-4">
          {content ? (
            content.split("\n\n").map((p, idx) => (
              <p key={idx}>{p}</p>
            ))
          ) : (
            <p>{summary}</p>
          )}
        </article>

        {related.length > 0 && (
          <div className="pt-12 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Related Public Announcements</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((ann) => (
                <AnnouncementCard key={ann.id} item={ann} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
