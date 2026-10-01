"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/page-hero";
import GalleryGrid from "@/components/gallery-grid";
import { CategoryFilter } from "@/components/search-filter";
import { galleryService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";

export default function GalleryPage() {
  const { t, getText } = useTranslation();
  const [images, setImages] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  const loadImages = () => {
    const res = galleryService.getAll({ status: "published" });
    setImages(res.items);
  };

  useEffect(() => {
    loadImages();
    const unsub = galleryService.subscribe(loadImages);
    return () => unsub();
  }, []);

  const categories = ["All", ...new Set(images.map((item) => item.category).filter(Boolean))];

  const filteredImages =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow={t("home.galleryEyebrow", "Visual Archive")}
        title={t("gallery.title", "Burayu Media Gallery")}
        description={t(
          "gallery.description",
          "Official photographs capturing civic developments, community programs, infrastructure milestones, and municipal leadership."
        )}
      />

      <div className="container-shell space-y-8">
        <div className="flex justify-center">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
          />
        </div>

        {filteredImages.length > 0 ? (
          <GalleryGrid images={filteredImages} />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <p className="text-base font-bold text-slate-800">{t("gallery.empty", "No gallery items available.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
