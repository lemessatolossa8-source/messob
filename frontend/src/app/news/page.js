"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/PageHero";
import { NewsCard } from "@/components/Cards";
import { CategoryFilter, Pagination, SearchBar } from "@/components/SearchFilter";
import { newsService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";

export default function NewsPage() {
  const { t, getText } = useTranslation();
  const { settings } = useSiteSettings();
  const contentSettings = settings?.contentSettings || {};
  const [news, setNews] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = Number(contentSettings.itemsPerPage) || 6;
  const enableSearch = contentSettings.enableSearch !== false;
  const enableFilters = contentSettings.enableFilters !== false;

  const loadNews = async () => {
    try {
      const res = await newsService.getAll({ status: "published", limit: 100 });
      setNews(res.items || []);
    } catch (err) {
      console.error("Failed to load news:", err);
      setNews([]);
    }
  };

  useEffect(() => {
    loadNews();
    const unsub = newsService.subscribe(loadNews);
    return () => unsub();
  }, []);

  const categories = ["All", ...new Set(news.map((item) => item.category).filter((c) => c && c.toLowerCase() !== "general"))];

  const filteredItems = news.filter((item) => {
    const title = getText(item.title).toLowerCase();
    const summary = getText(item.summary || item.description).toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = title.includes(q) || summary.includes(q);
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-12 pb-16">
      <PageHero
        title={t("news.title", "Official News & Updates")}
        description={t(
          "news.description",
          "Verified news stories, press disclosures, infrastructure developments, and municipal activities in Burayu."
        )}
        image=""
      />

      <div className="container-shell space-y-8">
        {(enableSearch || enableFilters) && (
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs md:flex-row md:items-center md:justify-between">
            {enableSearch && (
              <div className="w-full md:w-80">
                <SearchBar
                  value={searchQuery}
                  onChange={(q) => {
                    setSearchQuery(q);
                    setCurrentPage(1);
                  }}
                  placeholder={t("actions.searchPlaceholder", "Search news...")}
                />
              </div>
            )}

            {enableFilters && categories.length > 1 && (
              <CategoryFilter
                categories={categories}
                activeCategory={activeCategory}
                onSelectCategory={(c) => {
                  setActiveCategory(c);
                  setCurrentPage(1);
                }}
              />
            )}
          </div>
        )}

        {paginatedItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <p className="text-base font-bold text-[#070707]">{t("news.empty", "No news articles found.")}</p>
            <p className="mt-1 text-xs">{t("actions.filter", "Try adjusting your search query or category filter.")}</p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
