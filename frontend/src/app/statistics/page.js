"use client";

import { useState, useEffect } from "react";
import PageHero from "@/components/PageHero";
import MesobStats from "@/components/MesobStats";
import { statisticService } from "@/services";
import { useTranslation } from "@/context/LanguageContext";

export default function StatisticsPage() {
  const { t } = useTranslation();
  const [statistics, setStatistics] = useState([]);

  const loadStatistics = async () => {
    try {
      const res = await statisticService.getAll({ status: "published", limit: 50 });
      setStatistics(res.items || res.data?.items || []);
    } catch (err) {
      console.error("Failed to load statistics:", err);
      setStatistics([]);
    }
  };

  useEffect(() => {
    loadStatistics();
    const handleSync = () => loadStatistics();
    if (typeof window !== "undefined") {
      window.addEventListener("mesob_content_updated", handleSync);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mesob_content_updated", handleSync);
      }
    };
  }, []);

  return (
    <div className="space-y-12 pb-16">
      <PageHero
        eyebrow={t("stats.eyebrow", "Portal Metrics")}
        title="MESOB Statistics"
        description={t(
          "stats.desc",
          "Key administrative metrics and milestones delivered with transparency, speed, and dedication to the community."
        )}
      />

      <div className="container-shell space-y-8">
        <MesobStats stats={statistics} />
      </div>
    </div>
  );
}
