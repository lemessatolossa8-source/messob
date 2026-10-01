"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Tag, CheckCircle2 } from "lucide-react";
import { projectService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { StatusBadge } from "@/components/cards";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { t, getText } = useTranslation();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchProject = async () => {
      try {
        const found = await projectService.getById(id);
        if (found && (found.is_published || found.status === "published")) {
          setItem(found);
        }
      } catch (err) {
        console.error("Failed to load project:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
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
        <h2 className="text-2xl font-bold text-slate-900">Project Not Found</h2>
        <p className="text-xs text-slate-500">The requested infrastructure project is not currently available.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Projects</span>
        </Link>
      </div>
    );
  }

  const title = getText(item.title);
  const description = getText(item.description);
  const content = getText(item.content);
  const progress = Math.min(100, Math.max(0, Number(item.progress) || 0));

  return (
    <div className="py-12 pb-20">
      <div className="container-shell max-w-4xl space-y-8">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("actions.backToProjects", "Back to Projects")}</span>
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-900">
              {item.department || item.category || "Infrastructure"}
            </span>
            <StatusBadge status={item.projectStatus || item.status} />
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 border-b border-slate-200 pb-4 text-xs sm:text-sm text-slate-600">
            {item.location && (
              <span className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-amber-600" />
                {item.location}
              </span>
            )}
            {(item.start_date || item.startDate) && (
              <span className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-emerald-700" />
                {item.start_date || item.startDate} {item.end_date || item.targetCompletion ? `→ ${item.end_date || item.targetCompletion}` : ""}
              </span>
            )}
            {item.budget && (
              <span className="font-semibold text-slate-700">
                Fund: {item.budget}
              </span>
            )}
          </div>

          {/* Overall Project Progress */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700">Execution Progress</span>
              <span className="text-emerald-700 text-sm">{progress}% Complete</span>
            </div>
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
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
