"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { newsService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { NewsCard } from "@/components/cards";

export default function NewsDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { t, getText } = useTranslation();

  const [item, setItem] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = newsService.getById(id);
      if (found && found.status === "published") {
        setItem(found);
        const all = newsService.getAll({ status: "published" }).items;
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
        <h2 className="text-2xl font-bold text-slate-900">Article Not Found</h2>
        <p className="text-xs text-slate-500">The requested article is not currently published or available.</p>
        <Link href="/news" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-xs font-bold text-white">
          <ArrowLeft className="h-4 w-4" />
          <span>Return to News Hub</span>
        </Link>
      </div>
    );
  }

  const title = getText(item.title);
  const summary = getText(item.summary || item.description);
  const content = getText(item.content);
  const tags = Array.isArray(item.tags) ? item.tags : typeof item.tags === "string" ? item.tags.split(",").map((t) => t.trim()) : [];

  return (
    <div className="py-12 pb-20">
      <div className="container-shell max-w-4xl space-y-8">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 transition hover:text-emerald-600"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("actions.backToNews", "Back to News Hub")}</span>
        </Link>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-900">
              {item.category}
            </span>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              {item.date}
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl leading-tight">
            {title}
          </h1>

          <div className="mt-4 flex items-center justify-between border-b border-slate-200 pb-4 text-xs sm:text-sm text-slate-600">
            <span className="flex items-center gap-2 font-medium">
              <User className="h-4 w-4 text-slate-400" />
              {item.author || "Burayu MESOB Communications Desk"}
            </span>
          </div>
        </div>

        {item.image && (
          <div className="aspect-[16/9] w-full overflow-hidden rounded-3xl bg-slate-100 shadow-md">
            <img src={item.image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        {summary && (
          <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed border-l-4 border-emerald-600 pl-4">
            {summary}
          </p>
        )}

        <article className="prose prose-slate max-w-none text-base sm:text-lg text-slate-700 leading-relaxed space-y-4">
          {content ? (
            content.split("\n\n").map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          ) : (
            <p>{summary}</p>
          )}
        </article>

        {tags.length > 0 && (
          <div className="flex items-center gap-2 border-t border-b border-slate-200 py-4">
            <Tag className="h-4 w-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{t("news.tags", "Tags")}:</span>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div className="pt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t("news.related", "Related News Articles")}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((newsItem) => (
                <NewsCard key={newsItem.id} item={newsItem} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
