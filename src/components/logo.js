"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo({
  variant = "default", // 'default' | 'admin' | 'white' | 'compact'
  size = "md", // 'sm' | 'md' | 'lg' | 'xl'
  showText = true,
  href = "/",
  className = "",
  textClassName = "",
  onClick,
}) {
  const sizeMap = {
    sm: { dimension: 32, boxClass: "h-8 w-8" },
    md: { dimension: 44, boxClass: "h-11 w-11" },
    lg: { dimension: 56, boxClass: "h-14 w-14" },
    xl: { dimension: 72, boxClass: "h-18 w-18" },
  };

  const { dimension, boxClass } = sizeMap[size] || sizeMap.md;

  const content = (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      {/* Official Burayu MESOB Logo Container with aspect ratio preservation */}
      <div className={`relative shrink-0 overflow-hidden rounded-full ${boxClass} bg-white shadow-sm ring-1 ring-slate-900/10 flex items-center justify-center p-0.5`}>
        <Image
          src="/images/burayu-mesob-logo.jpg"
          alt="Magaalaa Burraayyuu - Burayu MESOB Official Logo"
          width={dimension}
          height={dimension}
          className="h-full w-full object-contain rounded-full"
          priority
        />
      </div>

      {showText && (
        <div className={`min-w-0 flex flex-col justify-center text-left ${textClassName}`}>
          {variant === "admin" ? (
            <>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
                Admin CMS
              </span>
              <span className="truncate text-base font-extrabold text-white">
                Burayu MESOB
              </span>
            </>
          ) : variant === "white" ? (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-300">
                Official Portal
              </span>
              <span className="truncate text-lg font-bold tracking-tight text-white">
                Burayu MESOB
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-amber-600">
                Official Portal
              </span>
              <span className="truncate text-lg font-bold tracking-tight text-slate-950">
                Burayu MESOB
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} onClick={onClick} className="inline-flex items-center shrink-0 group transition opacity-95 hover:opacity-100 focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
