"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { CategoryFilter } from "@/components/search-filter";
import { useTranslation } from "@/src/context/LanguageContext";

export default function GalleryGrid({ images }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const { getText } = useTranslation();

  // Build category list from raw values for accurate filtering; translate only for display
  const rawCategories = ["All", ...new Set(images.map((item) => item.category).filter(Boolean))];

  // Build translated labels map: rawValue → displayLabel
  const categoryLabels = Object.fromEntries(
    rawCategories.slice(1).map((cat) => [cat, getText(cat) || cat])
  );

  const filteredImages =
    activeCategory === "All"
      ? images
      : images.filter((img) => img.category === activeCategory);

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <CategoryFilter
          categories={rawCategories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          getLabel={(cat) => (cat === "All" ? "All" : categoryLabels[cat] || cat)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredImages.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedImage(item)}
            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm"
          >
            <img
              src={item.image}
              alt={getText(item.title) || "Gallery image"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

            <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 transition duration-300 group-hover:opacity-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                {getText(item.category)}
              </span>
                <h3 className="text-sm font-bold text-white line-clamp-1">{getText(item.title)}</h3>
                {item.description && (<p className="mt-2 text-xs text-slate-200">{getText(item.description)}</p>)}
            </div>
          </div>
        ))}
      </div>

      {selectedImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-white transition hover:bg-slate-900"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-[16/10] w-full bg-slate-950">
              <img
                src={selectedImage.image}
                alt={getText(selectedImage.title) || "Gallery image"}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="p-6">
              <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                {getText(selectedImage.category) || selectedImage.category}
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">
                {getText(selectedImage.title) || "Untitled"}
              </h3>
              {selectedImage.description ? (
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {getText(selectedImage.description)}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
