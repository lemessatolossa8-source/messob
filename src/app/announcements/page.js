"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/page-hero";
import { AnnouncementCard } from "@/components/cards";
import { CategoryFilter, Pagination, SearchBar } from "@/components/search-filter";
import { announcementService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";

export default function AnnouncementsPage() {
  const { t, getText } = useTranslation();
  const [announcements, setAnnouncements] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const res = announcementService.getAll({ status: "published" });
    setAnnouncements(res.items);
  }, []);

  const categories = ["All", ...new Set(announcements.map((item) => item.category).filter(Boolean))];

  const filteredItems = announcements.filter((item) => {
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
        eyebrow={t("announcements.eyebrow", "Time-Sensitive Notices")}
        title={t("announcements.title", "Public Announcements")}
        description={t(
          "announcements.description",
          "Official public notices, municipal schedules, and community advisories in Burayu."
        )}
        image=""
      />

      <div className="container-shell space-y-8">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-80">
            <SearchBar
              value={searchQuery}
              onChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              placeholder={t("actions.searchPlaceholder", "Search announcements...")}
            />
          </div>

          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={(c) => {
              setActiveCategory(c);
              setCurrentPage(1);
            }}
          />
        </div>

        {paginatedItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <p className="text-base font-bold text-slate-800">{t("announcements.empty", "No announcements available.")}</p>
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
