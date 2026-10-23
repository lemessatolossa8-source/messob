"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import SectionHeading from "@/components/SectionHeading";
import MesobStats from "@/components/MesobStats";
import {
  AnnouncementCard,
  NewsCard,
  FloorCard,
  ProjectCard,
} from "@/components/Cards";
import {
  newsService,
  announcementService,
  floorService,
  projectService,
  galleryService,
  slideService,
  statisticService,
} from "@/services";
import { useTranslation } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { getImageUrl } from "@/lib/imageUrl";

// Dynamically import below-the-fold GalleryGrid to defer bundle size and main-thread work
const GalleryGrid = dynamic(() => import("@/components/GalleryGrid"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="aspect-[4/3] rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200/80" />
      ))}
    </div>
  ),
});

// Dynamically import LocationMap to defer Google Maps iframe from critical render path
const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] rounded-2xl bg-neutral-100 animate-pulse border border-neutral-200/80 flex items-center justify-center text-neutral-400 text-sm">
      Loading map...
    </div>
  ),
});

const OFFICIAL_SLIDESHOW_HEADINGS_BRW = {
  om: {
    black: "WIIRTUU TAJAAJILA TOKKOFFAA (MESOB)",
    red: "BULCHIINSA MAGAALAA SHAGGARITTI",
    white: "DAMEE BURAAYYUU",
  },
  am: {
    black: "የሸገር ከተማ አስተዳደር",
    red: "የአንድ ማዕከል አገልግሎት (ሜሶብ)",
    white: "ቡራዩ ቅርንጫፍ",
  },
  en: {
    black: "SHAGGAR CITY ADMINISTRATION",
    red: "FIRST SERVICE CENTER,",
    white: "BURAYU BRANCH",
  },
};

export default function HomeClient({ initialData = {} }) {
  const { t, language } = useTranslation();
  const headingBRW =
    OFFICIAL_SLIDESHOW_HEADINGS_BRW[language] ||
    OFFICIAL_SLIDESHOW_HEADINGS_BRW.om;
  const { settings: siteSettings } = useSiteSettings();

  const [news, setNews] = useState(initialData.news || []);
  const [announcements, setAnnouncements] = useState(initialData.announcements || []);
  const [floors, setFloors] = useState(
    Array.isArray(initialData.floors) ? initialData.floors : []
  );
  const [floorsLoading, setFloorsLoading] = useState(false);
  const [floorsError, setFloorsError] = useState(null);
  const [projects, setProjects] = useState(initialData.projects || []);
  const [gallery, setGallery] = useState(initialData.gallery || []);
  const [slides, setSlides] = useState(
    Array.isArray(initialData.slides) ? initialData.slides : []
  );
  const [statistics, setStatistics] = useState(initialData.statistics || []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [prevSlide, setPrevSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const goToSlide = useCallback((index) => {
    if (slides.length <= 1) return;
    const target = ((index % slides.length) + slides.length) % slides.length;
    setCurrentSlide((curr) => {
      setPrevSlide(curr);
      return target;
    });
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    goToSlide(currentSlide + 1);
  }, [goToSlide, currentSlide]);

  const prevSlideAction = useCallback(() => {
    goToSlide(currentSlide - 1);
  }, [goToSlide, currentSlide]);

  const loadData = useCallback(async () => {
    try {
      const [newsRes, announcementsRes, floorsData, galleryRes, slideRes, projectsRes, statsRes] = await Promise.all([
        newsService.getAll({ status: "published", limit: 3 }),
        announcementService.getAll({ status: "published", limit: 3 }),
        floorService.getAll({ status: "published" }),
        galleryService.getAll({ status: "published", limit: 6 }),
        slideService.getAll({ status: "published", limit: 20 }),
        projectService.getAll({ status: "published", limit: 3 }),
        statisticService.getAll({ status: "published", limit: 20 }),
      ]);
      setNews(newsRes.items || newsRes.data?.items || []);
      setAnnouncements(announcementsRes.items || announcementsRes.data?.items || []);
      setFloors(Array.isArray(floorsData) ? floorsData : []);
      setFloorsError(null);
      setGallery(galleryRes.items || galleryRes.data?.items || []);
      setProjects(projectsRes.items || projectsRes.data?.items || []);
      setStatistics(statsRes.items || statsRes.data?.items || []);

      const rawSlides = slideRes.items || slideRes.data?.items || [];
      const sorted = rawSlides
        .filter((s) => s.status === "published")
        .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
      if (sorted.length > 0) {
        setSlides(sorted);
      }
    } catch (err) {
      console.error("Failed to load homepage data:", err);
      setFloorsError("Unable to load floors at the moment.");
    } finally {
      setFloorsLoading(false);
    }

  }, []);

  const hasInitialData = useRef(
    Boolean(
      (initialData.news && initialData.news.length > 0) ||
      (initialData.floors && initialData.floors.length > 0) ||
      (initialData.slides && initialData.slides.length > 0)
    )
  );

  // Fetch fresh data only on real CMS updates (avoid duplicate fetch on initial SSR mount)
  useEffect(() => {
    if (!hasInitialData.current) {
      loadData();
    }
    const handleSync = () => loadData();
    const unsubFloor = floorService.subscribe(loadData);
    window.addEventListener("mesob_content_updated", handleSync);
    return () => {
      unsubFloor();
      window.removeEventListener("mesob_content_updated", handleSync);
    };
  }, [loadData]);

  // Carousel auto-advance: rotates every 6s (6000ms) when not paused and more than 1 slide exists
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused, currentSlide, goToSlide]);

  // Touch swipe support for mobile devices
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlideAction();
    }
  };

  // Keyboard navigation for accessibility
  const handleSliderKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlideAction();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  const getSubtleZoomStyle = (isActive) => {
    return {
      transform: isActive ? "scale(1.04)" : "scale(1)",
      transition: isActive
        ? "transform 6000ms cubic-bezier(0.25, 1, 0.5, 1)"
        : "transform 800ms ease-out",
      transformOrigin: "center center",
    };
  };

  // Smooth scroll to targeted floor or section when hash is present or changes
  useEffect(() => {
    const handleHashScroll = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      if (!hash) return;
      const targetId = hash.replace("#", "");
      if (!targetId) return;

      const attemptScroll = (retries = 3) => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (retries > 0) {
          setTimeout(() => attemptScroll(retries - 1), 150);
        }
      };

      // Slight timeout to ensure DOM cards have finished rendering
      setTimeout(() => attemptScroll(4), 100);
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [floors]);

  const activeSlideIndex = slides.length > 0
    ? ((currentSlide % slides.length) + slides.length) % slides.length
    : 0;

  return (
    <>
      {/* Main Content wrapper */}
      <div className="space-y-16 sm:space-y-24 pb-12">
        {/* ================================================== */}
        {/* 1. HOMEPAGE HERO SLIDER — Premium Presentation     */}
        {/* ================================================== */}
        <section
          className="relative overflow-hidden w-full min-h-[580px] sm:min-h-[640px] md:min-h-[700px] lg:h-[82vh] max-h-[860px] bg-black select-none focus:outline-none"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Homepage Hero Carousel"
          aria-live="polite"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onKeyDown={handleSliderKeyDown}
        >
          {/* Slide images — Smooth Fade with subtle Zoom effect */}
          <div className="absolute inset-0 overflow-hidden">
            {slides.length > 0 ? (
              slides.map((slide, index) => {
                const isActive = index === activeSlideIndex;
                const isPrev = index === (((activeSlideIndex - 1) % slides.length) + slides.length) % slides.length;
                const isNext = index === (activeSlideIndex + 1) % slides.length;
                const isOutgoing = index === prevSlide && !isActive;
                const isFirst = index === 0;

                // Render active, previous/outgoing (for smooth 800ms crossfade), next (for instant prefetch), or first
                if (!isActive && !isPrev && !isNext && !isOutgoing && !isFirst) return null;

                const slideSrc = getImageUrl(slide.image);
                if (!slideSrc) return null;

                return (
                  <div
                    key={slide.id || index}
                    className={`absolute inset-0 transition-opacity ease-in-out ${isActive
                        ? "opacity-100 z-10"
                        : isPrev || isOutgoing
                          ? "opacity-0 z-[5] pointer-events-none"
                          : "opacity-0 z-0 pointer-events-none"
                      }`}
                    style={{
                      transitionDuration: "800ms",
                    }}
                    aria-hidden={!isActive}
                  >
                    {/* Inner subtle zoom container */}
                    <div
                      className="relative w-full h-full will-change-transform motion-reduce:transform-none motion-reduce:transition-none"
                      style={getSubtleZoomStyle(isActive)}
                    >
                      <Image
                        src={slideSrc}
                        alt={`Burayu MESOB Slide ${index + 1}`}
                        fill
                        priority={isFirst}
                        sizes="100vw"
                        quality={75}
                        className="object-cover object-center filter brightness-[0.88] contrast-[1.05] saturate-[1.04]"
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 bg-neutral-900" />
            )}
          </div>

          {/* Multi-layer contrast scrim for crisp text legibility across all slides */}
          <div
            className="absolute inset-0 bg-black/35 pointer-events-none z-[11]"
            aria-hidden="true"
          />
          <div
            className="absolute top-0 inset-x-0 h-72 sm:h-80 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-none z-[12]"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 inset-x-0 h-36 bg-gradient-to-t from-black/75 to-transparent pointer-events-none z-[12]"
            aria-hidden="true"
          />

          {/* Slide Content: Official Multilingual Heading positioned at top with BRW colors */}
          <div className="absolute top-0 inset-x-0 z-20 flex flex-col items-center justify-start pt-7 sm:pt-9 md:pt-12 lg:pt-14 px-4 sm:px-6 md:px-10 text-center pointer-events-none">
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center">
              <h1
                key={language}
                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[2.65rem] font-black text-center tracking-tight leading-[1.24] select-text"
              >
                <span
                  className="text-black inline"
                  style={{
                    WebkitTextStroke: "1.25px #FFFFFF",
                    textShadow: "0 0 16px rgba(255, 255, 255, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)",
                  }}
                >
                  {headingBRW.black}
                </span>{" "}
                <span
                  className="text-[#D71920] inline"
                  style={{
                    textShadow: "0 2px 16px rgba(0, 0, 0, 0.95), 0 0 12px rgba(215, 25, 32, 0.5)",
                  }}
                >
                  {headingBRW.red}
                </span>{" "}
                <span
                  className="text-white inline"
                  style={{
                    textShadow: "0 2px 16px rgba(0, 0, 0, 0.95)",
                  }}
                >
                  {headingBRW.white}
                </span>
              </h1>
            </div>
          </div>

          {/* Small pagination dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 sm:bottom-8 inset-x-0 z-30 flex items-center justify-center gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 bg-black/35 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
                {slides.map((slide, index) => {
                  const isActive = index === activeSlideIndex;
                  return (
                    <button
                      key={slide.id || index}
                      type="button"
                      onClick={() => goToSlide(index)}
                      aria-label={`Slide ${index + 1}`}
                      className="p-1 inline-flex items-center justify-center cursor-pointer focus:outline-none"
                    >
                      <span
                        className={`rounded-full transition-all duration-300 block ${isActive
                            ? "w-2.5 h-2.5 bg-[#C62828] shadow-[0_0_8px_rgba(198,40,40,0.8)]"
                            : "w-2 h-2 bg-white/40 hover:bg-white/80"
                          }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Abba Gadaa Red accent line */}
          <div className="absolute bottom-0 inset-x-0 h-[4px] w-full bg-[#C62828] shadow-[0_-2px_12px_rgba(198,40,40,0.5)] z-30" />
        </section>

        {/* ================================================== */}
        {/* 2. MESOB STATISTICS SECTION                       */}
        {/* ================================================== */}
        <section className="container-shell pt-4">
          <MesobStats stats={statistics} />
        </section>


        {/* ================================================== */}
        {/* 3. OUR SERVICES SECTION (BUILDING FLOORS)         */}
        {/* ================================================== */}
        <section className="bg-[#F5F7F6] py-16 border-y border-neutral-200/70 scroll-mt-24 relative" id="our-services">
          <span id="services" className="scroll-mt-28 absolute -top-24 pointer-events-none" />
          <span id="physical-services" className="scroll-mt-28 absolute -top-24 pointer-events-none" />
          <div className="container-shell space-y-8">
            <SectionHeading
              title={t("home.physicalServicesTitle")}
              description={t("home.physicalServicesDesc")}
              actionHref="/services#our-services"
              actionLabel={t("home.viewAllFloors", t("home.viewAllServices"))}
            />

            {floorsLoading ? (
              <div className="flex h-48 items-center justify-center">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
                  <span>Loading floors...</span>
                </div>
              </div>
            ) : floorsError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
                <p className="text-sm font-semibold">{floorsError}</p>
              </div>
            ) : floors.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {floors.map((item) => (
                  <FloorCard key={item.id || item._id} item={item} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center text-neutral-500 shadow-xs">
                <p className="text-sm font-medium">No floors available at the moment.</p>
              </div>
            )}
          </div>
        </section>


        {/* ================================================== */}
        {/* 4. PROJECTS SECTION                               */}
        {/* ================================================== */}
        <section className="container-shell space-y-8" id="projects-section">
          <SectionHeading
            title={t("home.projectsTitle")}
            description={t("home.projectsDesc")}
            actionHref="/projects"
            actionLabel={t("home.viewAllProjects")}
          />

          {projects.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((item) => (
                <ProjectCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">{t("home.noProjectsAvailable")}</p>
          )}
        </section>

        {/* ================================================== */}
        {/* 5. NEWS SECTION                                   */}
        {/* ================================================== */}
        <section className="bg-[#F5F7F6] py-16 border-y border-neutral-200/70">
          <div className="container-shell">
            <SectionHeading
              title={t("home.newsTitle")}
              description={t("home.newsDesc")}
              actionHref="/news"
              actionLabel={t("home.viewAllNews")}
            />

            {news.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {news.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-500">{t("home.noNewsAvailable")}</p>
            )}
          </div>
        </section>

        {/* ================================================== */}
        {/* 6. ANNOUNCEMENTS SECTION                          */}
        {/* ================================================== */}
        <section className="container-shell">
          <SectionHeading
            title={t("home.announcementsTitle")}
            description={t("home.announcementsDesc")}
            actionHref="/announcements"
            actionLabel={t("home.viewAllAnnouncements")}
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {announcements.map((item) => (
              <AnnouncementCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ================================================== */}
        {/* 7. MEDIA GALLERY PREVIEW                         */}
        {/* ================================================== */}
        {gallery.length > 0 && (
          <section className="container-shell">
            <SectionHeading
              title={t("home.galleryTitle")}
              actionHref="/gallery"
              actionLabel={t("home.viewFullGallery")}
            />

            <GalleryGrid images={gallery} />
          </section>
        )}

        {/* ================================================== */}
        {/* 8. FIND US — LOCATION SECTION                    */}
        {/* ================================================== */}
        <section className="container-shell space-y-8" id="find-us">
          <SectionHeading
            title={t("home.locationTitle", "Find Us")}
            description={t(
              "home.locationDescription",
              "Find the Burayu MESOB One Stop Service Building in Burayu, Oromia, Ethiopia."
            )}
          />
          <LocationMap
            compact
            address={siteSettings?.contactInfo?.address || contactInfo.address}
            phone={siteSettings?.contactInfo?.phone || contactInfo.phone}
            email={siteSettings?.contactInfo?.email || contactInfo.email}
            workingHours={siteSettings?.contactInfo?.workingHours || contactInfo.workingHours}
          />
        </section>
      </div>
    </>
  );
}
