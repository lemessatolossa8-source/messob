"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";

import { galleryService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";

export default function GalleryPage() {
  const { t, getText } = useTranslation();
  const [images, setImages] = useState([]);

  const loadImages = async () => {
    try {
      const res = await galleryService.getAll({ status: "published", limit: 100 });
      setImages(res.items || []);
    } catch (err) {
      console.error("Failed to load gallery:", err);
      setImages([]);
    }
  };

  useEffect(() => {
    loadImages();
    const unsub = galleryService.subscribe(loadImages);
    return () => unsub();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow={t("home.galleryEyebrow", "Visual Archive")}
        title={t("gallery.title", "Our Gallery")}
        description={t(
          "gallery.description",
          "Official photographs capturing civic developments, community programs, infrastructure milestones, and municipal leadership."
        )}
      />

      <div className="container-shell space-y-8">
        {images.length > 0 ? (
          <GalleryGrid images={images} />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            <p className="text-base font-bold text-[#070707]">{t("gallery.empty", "No gallery items available.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
