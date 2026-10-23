"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";
import { getImageUrl } from "@/lib/imageUrl";

export default function GalleryGrid({ images }) {
  const { getText } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredImages = images || [];

  return (
    <div>
      {/* Responsive Gallery Grid — Preserved layout, rounded corners, and spacing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredImages.map((item) => {
          // Dynamic title retrieval from admin-managed database record (multilingual or string)
          const title =
            getText(item.title) ||
            (typeof item.title === "string" ? item.title : "");

          return (
            <div
              key={item.id}
              role="button"
              tabIndex={0}
              aria-label={title || "View gallery image"}
              onClick={() => setSelectedImage(item)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedImage(item);
                }
              }}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-neutral-200 bg-[#000000] shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#D71920]/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D71920]"
            >
              {/* Aspect Ratio Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-900">
                {/* Image with 300ms smooth zoom effect on hover */}
                <Image
                  src={getImageUrl(item.image || item.imageUrl)}
                  alt={title || "Burayu MESOB Gallery photograph"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                  quality={80}
                  className="object-cover transition-transform duration-300 ease-out will-change-transform group-hover:scale-105 group-focus-within:scale-105"
                />

                {/* Subtle dark gradient overlay:
                    - Desktop: hidden by default (opacity-0), smooth 300ms fade-in on hover
                    - Mobile/Touch: subtle bottom scrim so title is readable without mouse hover
                */}
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 group-focus-within:opacity-100 max-md:opacity-100 max-md:from-black/75 max-md:via-black/20"
                  aria-hidden="true"
                />

                {/* White-text Title Overlay near the bottom:
                    - Desktop: hidden by default, smooth 300ms fade-in on hover
                    - Mobile/Touch: accessible directly near bottom without mouse hover
                    - Permanently visible bottom cards removed
                */}
                {title ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 translate-y-1 p-4 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 max-md:translate-y-0 max-md:opacity-100 sm:p-5">
                    <p className="line-clamp-2 text-xs font-bold leading-snug text-white drop-shadow-md sm:text-sm">
                      {title}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {selectedImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-in fade-in duration-200 sm:p-6"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative max-w-4xl w-full overflow-hidden rounded-2xl border border-neutral-800 bg-[#000000] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-neutral-700 bg-black/80 text-white shadow-lg transition-all duration-200 hover:border-[#D71920] hover:bg-[#D71920]"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Preview Image */}
            <div className="relative aspect-[16/10] w-full bg-black flex items-center justify-center p-2">
              <img
                src={getImageUrl(selectedImage.image || selectedImage.imageUrl)}
                alt={
                  getText(selectedImage.title) ||
                  (typeof selectedImage.title === "string" ? selectedImage.title : "") ||
                  "Gallery preview"
                }
                className="max-h-[75vh] w-full object-contain rounded-lg"
              />
            </div>

            {/* Modal Title Footer */}
            {getText(selectedImage.title) ||
            (typeof selectedImage.title === "string" ? selectedImage.title : "") ? (
              <div className="border-t border-neutral-800 bg-[#000000] p-4 text-center sm:p-5">
                <p className="mx-auto max-w-2xl text-sm font-bold text-white sm:text-base">
                  {getText(selectedImage.title) ||
                    (typeof selectedImage.title === "string" ? selectedImage.title : "")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
