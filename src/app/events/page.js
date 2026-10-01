"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/page-hero";
import { EventCard } from "@/components/cards";
import { Pagination, SearchBar } from "@/components/search-filter";
import { eventService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";

export default function EventsPage() {
  const { t, getText } = useTranslation();
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const res = eventService.getAll({ status: "published" });
    setEvents(res.items);
  }, []);

  const filteredItems = events.filter((item) => {
    const title = getText(item.title).toLowerCase();
    const desc = getText(item.description).toLowerCase();
    const loc = (item.location || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    return title.includes(q) || desc.includes(q) || loc.includes(q);
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow={t("events.eyebrow", "Civic Schedule")}
        title={t("events.title", "Events & Civic Gatherings")}
        description={t(
          "events.description",
          "Upcoming public forums, town halls, exhibitions, and municipal initiatives in Burayu."
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
              placeholder="Search events by title or location..."
            />
          </div>
        </div>

        {paginatedItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {paginatedItems.map((item) => (
              <EventCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <p className="text-base font-bold text-slate-800">{t("events.empty", "No scheduled events found.")}</p>
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
