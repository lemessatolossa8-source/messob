"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import PageHero from "@/components/PageHero";
import { FloorCard } from "@/components/Cards";
import { floorService } from "@/src/services";
import { useTranslation } from "@/src/context/LanguageContext";

function ServicesContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const floorParam = searchParams.get("floor");

  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFloors = async () => {
    try {
      const data = await floorService.getAll({ status: "published" });
      setFloors(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error("Failed to load floors:", err);
      setError("Unable to load floors at the moment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await floorService.getAll({ status: "published" });
        if (isMounted) {
          setFloors(Array.isArray(data) ? data : []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load floors:", err);
          setError("Unable to load floors at the moment.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    const handleSync = () => fetchFloors();
    const unsub = floorService.subscribe(handleSync);
    window.addEventListener("focus", handleSync);
    window.addEventListener("mesob_content_updated", handleSync);

    return () => {
      isMounted = false;
      unsub();
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("mesob_content_updated", handleSync);
    };
  }, []);

  // Smooth scroll to targeted floor when hash is present or query param is provided
  useEffect(() => {
    const handleHashScroll = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash;
      const targetFloor = floorParam ? `floor-${floorParam}` : hash ? hash.replace("#", "") : null;
      if (!targetFloor) return;

      const attemptScroll = (retries = 3) => {
        const el = document.getElementById(targetFloor);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (retries > 0) {
          setTimeout(() => attemptScroll(retries - 1), 150);
        }
      };

      setTimeout(() => attemptScroll(4), 100);
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [floors, floorParam]);

  return (
    <div className="space-y-12 pb-16">
      {/* Page Hero */}
      <PageHero
        eyebrow={t("home.physicalServicesEyebrow", t("services.eyebrow", "PHYSICAL / ADMINISTRATIVE SERVICES"))}
        title={t("home.physicalServicesTitle", t("services.title", "OUR SERVICES"))}
        description={t(
          "home.physicalServicesDesc",
          t(
            "services.description",
            "Comprehensive guide to municipal, administrative, and public services across building floors at Burayu MESOB."
          )
        )}
        image=""
      />

      <div className="container-shell space-y-8" id="our-services">
        {/* Floors Directory Section */}
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
              <span>Loading floors...</span>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : floors.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 space-y-2 shadow-xs">
            <h3 className="text-base font-bold text-[#070707]">No floors available</h3>
            <p className="text-xs text-slate-500">No floor records are currently published.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {floors.map((item) => (
              <FloorCard key={item.id || item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FE0002] border-t-transparent" />
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}

