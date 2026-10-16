"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import MesobStats from "@/components/MesobStats";
import {
  AnnouncementCard,
  NewsCard,
  ServiceCard,
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
  siteService,
  statisticService,
} from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";
import { useSiteSettings } from "@/src/context/SiteSettingsContext";
import AnimatedWelcomeText from "@/components/AnimatedWelcomeText";

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

import { getImageUrl } from "@/src/lib/imageUrl";

export default function HomeClient({ initialData = {} }) {
  const { t } = useTranslation();
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
  const [cityInfo, setCityInfo] = useState({});
  const [contactInfo, setContactInfo] = useState({});
  const [currentSlide, setCurrentSlide] = useState(0);

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

    setCityInfo(siteService.getCityInfo() || {});
    setContactInfo(siteService.getContactInfo() || {});
  }, []);

  // Fetch fresh data and listen for CMS updates / window focus
  useEffect(() => {
    loadData();
    const handleSync = () => loadData();
    const unsubFloor = floorService.subscribe(loadData);
    window.addEventListener("focus", handleSync);
    window.addEventListener("mesob_content_updated", handleSync);
    return () => {
      unsubFloor();
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("mesob_content_updated", handleSync);
    };
  }, [loadData]);

  // Carousel auto-advance: rotates every 6 seconds when more than 1 slide exists
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

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

  return (
    <>
      {/* Main Content wrapper */}
      <div className="space-y-16 sm:space-y-24 pb-12">
        {/* ================================================== */}
        {/* 1. HERO SECTION                                   */}
        {/* ================================================== */}
        <section className="relative overflow-hidden text-white min-h-[580px] sm:min-h-[640px] flex flex-col justify-between">
          {/* City/Community Images Background - Image-only carousel */}
          <div className="absolute inset-0 overflow-hidden">
            {slides.length > 0 ? (
              slides.map((slide, index) => {
                const activeSlideIndex = ((currentSlide % slides.length) + slides.length) % slides.length;
                const isActive = index === activeSlideIndex;
                const isFirst = index === 0;
                const slideSrc = getImageUrl(slide.image);
                if (!slideSrc) return null;
                return (
                  <div
                    key={slide.id || index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={slideSrc}
                      alt={`Burayu MESOB Slide ${index + 1}`}
                      fill
                      priority={isFirst}
                      fetchPriority={isFirst ? "high" : "low"}
                      loading={isFirst ? undefined : "lazy"}
                      sizes="(max-width: 640px) 435px, 100vw"
                      quality={75}
                      className="object-cover object-center"
                    />
                  </div>
                );
              })
            ) : (
              <div className="absolute inset-0 bg-slate-950" />
            )}
          </div>

          <div className="container-shell relative z-10 py-16 sm:py-24 lg:py-28 flex-1 flex flex-col items-center justify-center text-center">
            <div className="max-w-5xl mx-auto w-full">
              <AnimatedWelcomeText />
            </div>
          </div>

          {/* Slide Indicators */}
          {slides.length > 1 && (
            <div className="relative z-10 container-shell pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
                  }}
                  aria-label="Previous slide"
                  className="rounded-full bg-black/50 hover:bg-black/80 p-2 text-white transition min-h-[36px] min-w-[36px] inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {slides.map((slide, index) => {
                  const activeSlideIndex = ((currentSlide % slides.length) + slides.length) % slides.length;
                  return (
                    <button
                      key={slide.id || index}
                      onClick={() => {
                        setCurrentSlide(index);
                      }}
                      aria-label={`Slide ${index + 1}`}
                      className="p-2 inline-flex items-center justify-center min-h-[32px] min-w-[32px] cursor-pointer"
                    >
                      <span
                        className={`h-2.5 rounded-full transition-colors duration-200 block ${
                          index === activeSlideIndex
                            ? "w-8 bg-[#F2C94C] shadow-sm"
                            : "w-2.5 bg-white/60 hover:bg-white"
                        }`}
                      />
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setCurrentSlide((prev) => (prev + 1) % slides.length);
                  }}
                  aria-label="Next slide"
                  className="rounded-full bg-black/50 hover:bg-black/80 p-2 text-white transition min-h-[36px] min-w-[36px] inline-flex items-center justify-center cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Bottom Accent Line (Red) */}
          <div className="h-[4px] w-full bg-[#FE0002]"></div>
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
        {/* 5. PROJECTS SECTION                               */}
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
        {/* 6. NEWS SECTION                                   */}
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
        {/* 7. ANNOUNCEMENTS SECTION                          */}
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
        {/* 9. MEDIA GALLERY PREVIEW                         */}
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
        {/* 10. FIND US — LOCATION SECTION                    */}
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
