"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { projectService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { StatusBadge } from "@/components/Cards";
import { getImageUrl } from "@/lib/imageUrl";

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
        <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#D71920] border-t-transparent" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-shell py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-[#000000]">Project Not Found</h2>
        <p className="text-xs text-neutral-500">The requested infrastructure project is not currently available.</p>
        <Link href="/projects" className="inline-flex items-center gap-2 rounded-full bg-[#000000] hover:bg-[#D71920] px-5 py-2 text-xs font-bold text-white transition">
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
        {/* Back Link */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#000000] hover:text-[#D71920] transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("actions.backToProjects", "Back to Projects")}</span>
        </Link>

        {/* Title & Metadata */}
        <div>
          <h1 className="text-3xl font-black text-[#000000] sm:text-4xl lg:text-5xl leading-tight">
            {title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-6 border-b border-neutral-200 pb-4 text-xs sm:text-sm text-neutral-600">
            {item.location && (
              <span className="flex items-center gap-2 font-medium">
                <MapPin className="h-4 w-4 text-[#D71920]" />
                {item.location}
              </span>
            )}
            {(item.start_date || item.startDate) && (
              <span className="flex items-center gap-2 font-medium">
                <Calendar className="h-4 w-4 text-neutral-600" />
                {item.start_date || item.startDate} {item.end_date || item.targetCompletion ? `→ ${item.end_date || item.targetCompletion}` : ""}
              </span>
            )}
          </div>
        </div>

        {/* Project Image */}
        {item.image && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm border border-neutral-200">
            <Image
              src={getImageUrl(item.image)}
              alt={title || "Project"}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        )}

        {/* Status and Progress */}
        <div className="p-5 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#000000] uppercase tracking-wider">Status:</span>
              <StatusBadge status={item.projectStatus || item.status} />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#000000]">
              <span className="text-neutral-500 font-medium">Progress:</span>
              <span className="text-base font-extrabold text-[#D71920]">{progress}%</span>
              <span className="text-neutral-400 font-normal">Complete</span>
            </div>
          </div>
          <div className="h-2.5 w-full bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#D71920] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-base sm:text-lg font-medium text-[#000000] leading-relaxed border-l-4 border-[#D71920] pl-4">
            {description}
          </p>
        )}

        {/* Full Details Content */}
        <article className="prose prose-neutral max-w-none text-base text-[#000000] leading-relaxed space-y-4">
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
