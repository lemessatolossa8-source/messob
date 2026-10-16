import { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

export default function LocationMap({
  title = "Burayu MESOB One-Stop Service Center",
  subtitle = "Location",
  address = "Burayu MESOB One Stop Service Building, Burayu, Oromia, Ethiopia",
  plusCode = "3MC5+R5M",
  phone = "+251944664433",
  email = "mesobburayubranch@gmail.com",
  workingHours = "Mon - Fri: 8:30 AM - 5:30 PM | Sat: 8:30 AM - 12:30 PM",
  latitude = 9.071792,
  longitude = 38.658089,
  className = "",
  compact = false,
}) {
  const { t, getText } = useTranslation();
  const [inView, setInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const displayTitle = getText(title) || title;
  const mapQuery = encodeURIComponent(`${displayTitle.includes("MESOB") ? "Burayu MESOB One Stop Service Building" : displayTitle}, ${plusCode}, Burayu, Oromia, Ethiopia`);

  // Google Maps Embed API (official): requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
  // Query is the verified place name + Plus Code, not guessed lat/lng.
  const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapIframeSrc = mapsApiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsApiKey}&q=${mapQuery}`
    : // Fallback (no key configured): Google Maps place embed with the same query
      `https://maps.google.com/maps?q=${mapQuery}&z=16&output=embed`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  return (
    <div ref={containerRef} className={`overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm ${className}`} id="LocationMap">
      <div className="grid gap-0 lg:grid-cols-12">
        {/* Left Side: Interactive Map */}
        <div className={`relative ${compact ? "min-h-[300px]" : "min-h-[380px]"} lg:col-span-7 bg-neutral-100 overflow-hidden flex items-center justify-center`}>
          {inView ? (
            <iframe
              title="Burayu MESOB Official Location Map"
              width="100%"
              height="100%"
              className="absolute inset-0 h-full w-full border-0 filter contrast-[1.05]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ border: 0 }}
              src={mapIframeSrc}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-neutral-400 text-sm font-medium">
              <span>{displayTitle}</span>
            </div>
          )}

          {/* Interactive Floating Location Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-white/20 bg-[#070707] p-3 text-white shadow-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FE0002] text-white shrink-0">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-white">{t("locationMap.findUs", "FIND US")}</p>
              <p className="text-[11px] font-medium text-neutral-200">{t("locationMap.cityRegion", "Burayu, Oromia, Ethiopia")}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Official Contact & Navigation Info */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 bg-white text-[#070707] border-l border-neutral-200/80">
          <div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#FE0002]/20 bg-slate-50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#FE0002]">
              <Navigation className="h-3.5 w-3.5 text-[#FE0002]" />
              <span>{t("locationMap.officialDesk", "Official Administration Desk")}</span>
            </div>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-[#070707]">
              {displayTitle}
            </h3>

            <p className="mt-1 text-sm font-semibold text-neutral-600">
              {t("locationMap.cityRegion", "Burayu, Oromia, Ethiopia")}
            </p>

            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
              {t("locationMap.subTitleDesc", "Wiirtuu Tajaajila Tokkooffaa (MESOB) Bulchiinsa Magaalaa Shaggaritti Damee Buraayyuu.")}
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.officialAddress", "Official Address")}</p>
                  <p className="text-[#070707] font-semibold mt-0.5">{getText(address)}</p>
                  <p className="text-neutral-500 mt-1">Plus Code: <strong className="text-[#070707]">{plusCode}</strong></p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.contactDesk", "Contact Desk")}</p>
                  <p className="text-[#070707] font-semibold mt-0.5">{phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.officialEmail", "Official Email")}</p>
                  <p className="text-[#070707] font-semibold mt-0.5">{email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#FE0002] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">{t("locationMap.workingInfo", "Working Information")}</p>
                  <p className="text-[#070707] font-semibold mt-0.5">{getText(workingHours)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FE0002] hover:bg-[#CC0002] px-6 py-3.5 text-xs font-bold uppercase text-white shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]"
            >
              <Navigation className="h-4 w-4" />
              <span>{t("locationMap.getDirections", "Get Directions")}</span>
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-xs font-bold uppercase text-[#070707] shadow-xs transition-all duration-200 hover:border-[#FE0002] hover:text-[#FE0002] hover:shadow-md hover:-translate-y-[2px] active:translate-y-0"
            >
              <span>{t("locationMap.viewOnGoogleMaps", "View on Google Maps")}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
