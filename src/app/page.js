"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import AccessEServiceButton from "@/components/access-eservice-button";
import SectionHeading from "@/components/section-heading";
import MesobStats from "@/components/mesob-stats";
import EServicesSection from "@/components/eservices-section";
import LocationMap from "@/components/location-map";
import {
  AnnouncementCard,
  NewsCard,
  ServiceCard,
  ProjectCard,
} from "@/components/cards";
import GalleryGrid from "@/components/gallery-grid";
import {
  newsService,
  announcementService,
  serviceService,
  projectService,
  galleryService,
  slideService,
  siteService,
} from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";

export default function HomePage() {
  const { t, getText } = useTranslation();

  const [news, setNews] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [slides, setSlides] = useState([]);
  const [cityInfo, setCityInfo] = useState({});
  const [contactInfo, setContactInfo] = useState({});

  const loadData = useCallback(() => {
    setNews(newsService.getAll({ status: "published", limit: 3 }).items);
    setAnnouncements(announcementService.getAll({ status: "published", limit: 3 }).items);
    setServices(serviceService.getAll({ status: "published", limit: 6 }).items);
    setGallery(galleryService.getAll({ status: "published", limit: 6 }).items);
    setCityInfo(siteService.getCityInfo() || {});
    setContactInfo(siteService.getContactInfo() || {});

    const slideRes = slideService.getAll({ status: "published" });
    const sorted = (slideRes.items || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    setSlides(sorted);
  }, []);

  // Projects use the real API (async)
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await projectService.getAll({ status: "published", limit: 3 });
        setProjects(res.items || []);
      } catch (err) {
        console.error("Failed to load homepage projects:", err);
        setProjects([]);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    loadData();
    const unsubs = [
      newsService.subscribe(loadData),
      announcementService.subscribe(loadData),
      serviceService.subscribe(loadData),
      galleryService.subscribe(loadData),
      slideService.subscribe(loadData),
      siteService.subscribe(loadData),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, [loadData]);

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const activeSlide = slides[currentSlide] || slides[0] || null;

  return (
    <div className="space-y-16 sm:space-y-24 pb-12">
      {/* ================================================== */}
      {/* 1. HERO SECTION                                   */}
      {/* ================================================== */}
      {/* ================================================== */}
      {/* 1. HERO SECTION                                   */}
      {/* ================================================== */}
      <section className="relative overflow-hidden text-white min-h-[580px] sm:min-h-[640px] flex flex-col justify-between">
        {/* City/Community Images Background - Pure slides, no overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {slides.length > 0 ? (
            slides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <div
                  key={slide.id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
                  }`}
                >
                  <img
                    src={slide.image || "/images/burayu-mesob-logo.png"}
                    alt={getText(slide.title) || "Burayu MESOB"}
                    className={`h-full w-full object-cover object-center transition-transform duration-[8000ms] ease-out ${
                      isActive ? "scale-105" : "scale-100"
                    }`}
                  />
                </div>
              );
            })
          ) : (
            <div className="absolute inset-0">
              <img
                src="/images/burayu-mesob-logo.png"
                alt="Burayu City"
                className="h-full w-full object-cover object-center"
              />
            </div>
          )}
        </div>

        <div className="container-shell relative z-10 py-16 sm:py-24 lg:py-28 flex-1 flex flex-col justify-center">
          <div className="max-w-3xl">
            {/* Eyebrow Badge with semi-transparent background for readability */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/60 px-4 py-1.5 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-[#F2C94C] shrink-0" />
              <span>
                Wiirtuu Tajaajila Tokkooffaa (MESOB) Bulchiinsa Magaalaa Shaggaritti Damee Buraayyuu
              </span>
            </div>

            {/* Clear Oromo Welcome Headline */}
            <h1 className="mt-6 text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
              Baga Nagaan Gara Wiirtuu Tajaajila Tokkooffaa (MESOB) Buraayyuutti Dhuftan
            </h1>

            {/* Multilingual Supporting Text (Amharic & English) with semi-transparent background */}
            <div className="mt-4 space-y-1.5 border-l-2 border-[#F2C94C] pl-4 max-w-2xl bg-black/50 py-2 rounded-r-xl backdrop-blur-sm">
              <p className="text-sm sm:text-base text-neutral-100 font-medium">
                ወደ ቡራዩ መሶብ የመጀመሪያ ደረጃ አገልግሎት መስጫ ማዕከል እንኳን በደህና መጡ
              </p>
              <p className="text-xs sm:text-sm text-neutral-200/90 font-normal">
                Official Public Administration & Digital E-Service Gateway — Shaggar City Administration
              </p>
            </div>

            {/* Slide / Mission Message */}
            <p className="mt-4 text-xs sm:text-sm text-neutral-200 leading-relaxed max-w-2xl font-normal bg-black/40 px-3 py-2 rounded-lg backdrop-blur-sm">
              {activeSlide && activeSlide.message
                ? getText(activeSlide.message)
                : "Tajaajiloota mootummaa, beeksisa yeroo, misooma bu'uuraalee, carraawwan invastimantii fi tajaajila elektirooniksii iftoominaafi si'aayinaan lammiileef dhiyeessina."}
            </p>

            {/* Primary Green Action Button with consistent styling */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-[25px] px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition bg-[#087443] hover:bg-[#075C36] focus:outline-none focus:ring-2 focus:ring-white active:scale-[0.98] h-[46px]"
              >
                <span>Tajaajiloota / Explore Services</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        {slides.length > 1 && (
          <div className="relative z-10 container-shell pb-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                aria-label="Previous slide"
                className="rounded-full bg-black/50 hover:bg-black/80 p-2 text-white transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {slides.map((slide, index) => (
                <button
                  key={slide.id || index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Slide ${index + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    index === currentSlide
                      ? "w-8 bg-[#F2C94C] shadow-sm"
                      : "w-2.5 bg-white/60 hover:bg-white"
                  }`}
                />
              ))}

              <button
                type="button"
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                aria-label="Next slide"
                className="rounded-full bg-black/50 hover:bg-black/80 p-2 text-white transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Bottom Oromo Cultural Identity Accent Line (Green / Gold) */}
        <div className="h-[4px] w-full flex">
          <span className="flex-1 bg-[#087443]" />
          <span className="flex-1 bg-[#F2C94C]" />
        </div>
      </section>

      {/* ================================================== */}
      {/* 2. MESOB STATISTICS SECTION                       */}
      {/* ================================================== */}
      <section className="container-shell pt-4">
        <MesobStats />
      </section>

      {/* ================================================== */}
      {/* 3. PHYSICAL / ADMINISTRATIVE SERVICES SECTION     */}
      {/* ================================================== */}
      <section className="bg-[#F5F7F6] py-16 border-y border-neutral-200/70" id="physical-services">
        <div className="container-shell space-y-8">
          <SectionHeading
            eyebrow="PHYSICAL / ADMINISTRATIVE SERVICES"
            title="OUR SERVICES"
            description="Administrative and public services provided at Burayu MESOB physical counters and offices."
            actionHref="/services"
            actionLabel="View All Services"
          />

          {services.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((item) => (
                <ServiceCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No physical services available.</p>
          )}
        </div>
      </section>

      {/* ================================================== */}
      {/* 4. ONLINE / DIGITAL E-SERVICES SECTION - REMOVED */}
      {/* ================================================== */}
      {/* <section className="container-shell py-4">
        <EServicesSection />
      </section> */}

      {/* ================================================== */}
      {/* 5. PROJECTS SECTION                               */}
      {/* ================================================== */}
      <section className="container-shell space-y-8" id="projects-section">
        <SectionHeading
          eyebrow="MUNICIPAL DEVELOPMENT"
          title="PROJECTS"
          description="Key municipal infrastructure and public development projects in Burayu."
          actionHref="/projects"
          actionLabel="View All Projects"
        />

        {projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((item) => (
              <ProjectCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No projects available.</p>
        )}
      </section>

      {/* ================================================== */}
      {/* 6. NEWS SECTION                                   */}
      {/* ================================================== */}
      <section className="bg-[#F5F7F6] py-16 border-y border-neutral-200/70">
        <div className="container-shell">
          <SectionHeading
            eyebrow="OFFICIAL UPDATES"
            title="NEWS"
            description="Verified news stories and development reports from Burayu MESOB."
            actionHref="/news"
            actionLabel="View All News"
          />

          {news.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No news articles available.</p>
          )}
        </div>
      </section>

      {/* ================================================== */}
      {/* 7. ANNOUNCEMENTS SECTION                          */}
      {/* ================================================== */}
      <section className="container-shell">
        <SectionHeading
          eyebrow="PUBLIC ADVISORIES"
          title="ANNOUNCEMENTS"
          description="Time-sensitive public announcements and administrative notices."
          actionHref="/announcements"
          actionLabel="View All Announcements"
        />

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {announcements.map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* ================================================== */}
      {/* 8. LOCATION / MAP SECTION - REMOVED              */}
      {/* ================================================== */}
      {/* Location information moved to About/City Information page */}

      {/* ================================================== */}
      {/* 9. MEDIA GALLERY PREVIEW                         */}
      {/* ================================================== */}
      {gallery.length > 0 && (
        <section className="container-shell">
          <SectionHeading
            eyebrow="VISUAL ARCHIVE"
            title="MEDIA GALLERY"
            actionHref="/gallery"
            actionLabel="View Full Gallery"
          />

          <GalleryGrid images={gallery} />
        </section>
      )}
    </div>
  );
}
