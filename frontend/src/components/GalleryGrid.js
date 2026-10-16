"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";
import { getImageUrl } from "@/lib/imageUrl";

export default function GalleryGrid({ images }) {
  const { getText } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);

  // We no longer filter by category, display all images
  const filteredImages = images || [];

  return (
    <div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredImages.map((item) => {
          const title = getText(item.title) || (typeof item.title === "string" ? item.title : "");

          return (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group flex flex-col cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-[3px] hover:shadow-md hover:border-[#FE0002]/40"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                <Image
                  src={getImageUrl(item.image || item.imageUrl)}
                  alt={title || "Gallery image"}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading="lazy"
                  quality={75}
                  className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02] group-hover:opacity-95"
                />
                {/* Simple gradient overlay on hover for a clean visual effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10" />
              </div>
              {title ? (
                <div className="p-3.5 bg-white border-t border-slate-100">
                  <p className="font-bold text-xs sm:text-sm text-[#070707] line-clamp-2 group-hover:text-[#FE0002] transition-colors">
                    {title}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {selectedImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
          <div className="relative max-w-4xl w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900/70 text-white transition duration-200 hover:bg-[#FE0002]"
              aria-label="Close image preview"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="aspect-[16/10] w-full bg-black flex items-center justify-center">
              <img
                src={getImageUrl(selectedImage.image || selectedImage.imageUrl)}
                alt={getText(selectedImage.title) || (typeof selectedImage.title === "string" ? selectedImage.title : "") || "Gallery preview"}
                className="max-h-[80vh] w-full object-contain"
              />
            </div>

            {(getText(selectedImage.title) || (typeof selectedImage.title === "string" ? selectedImage.title : "")) ? (
              <div className="p-4 bg-slate-950 text-center border-t border-slate-800">
                <p className="text-sm font-semibold text-white">
                  {getText(selectedImage.title) || (typeof selectedImage.title === "string" ? selectedImage.title : "")}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
