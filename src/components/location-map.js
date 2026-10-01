"use client";

import { MapPin, Navigation, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { useTranslation } from "@/src/context/LanguageContext";

export default function LocationMap({
  address = "Burayu MESOB Administration, Shaggar City, Oromia, Ethiopia",
  phone = "+251944664433",
  email = "mesobburayubranch@gmail.com",
  workingHours = "Mon - Fri: 8:30 AM - 5:30 PM | Sat: 8:30 AM - 12:30 PM",
  googleMapsUrl = "https://maps.google.com/?q=Burayu+Administration+Shaggar+Oromia+Ethiopia",
  latitude = 9.056,
  longitude = 38.647,
  className = "",
}) {
  const { t } = useTranslation();

  // Embeddable OpenStreetMap iframe for interactive location map display
  const mapIframeSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.015}%2C${latitude - 0.015}%2C${longitude + 0.015}%2C${latitude + 0.015}&layer=mapnik&marker=${latitude}%2C${longitude}`;

  return (
    <div className={`overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm ${className}`} id="location-map">
      <div className="grid gap-0 lg:grid-cols-12">
        {/* Left Side: Interactive Map */}
        <div className="relative min-h-[380px] lg:col-span-7 bg-neutral-100 overflow-hidden">
          <iframe
            title="Burayu MESOB Official Location Map"
            width="100%"
            height="100%"
            className="absolute inset-0 h-full w-full border-0 filter contrast-[1.05]"
            loading="lazy"
            allowFullScreen
            src={mapIframeSrc}
          />

          {/* Interactive Floating Location Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-white/20 bg-[#0F5132] p-3 text-white shadow-md">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#176B3A] text-white shrink-0">
              <MapPin className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-white">FIND BURAYU MESOB</p>
              <p className="text-[11px] font-medium text-neutral-200">Shaggar City Administration</p>
            </div>
          </div>
        </div>

        {/* Right Side: Official Contact & Navigation Info */}
        <div className="flex flex-col justify-between p-6 sm:p-8 lg:col-span-5 bg-white text-[#17221B] border-l border-neutral-200/80">
          <div>
            {/* Subtle Oromo Cultural Identity Accent Bar */}
            <div className="mb-3 flex h-1 w-14 overflow-hidden rounded-full">
              <span className="w-3/4 bg-[#176B3A]" />
              <span className="w-1/4 bg-[#B32025]" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#176B3A]/20 bg-[#F5F7F6] px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#176B3A]">
              <Navigation className="h-3.5 w-3.5 text-[#176B3A]" />
              <span>Official Administration Desk</span>
            </div>

            <h3 className="mt-4 text-2xl font-black tracking-tight text-[#17221B]">
              Burayu MESOB Location
            </h3>

            <p className="mt-2 text-xs text-neutral-600 leading-relaxed font-normal">
              Wiirtuu Tajaajila Tokkooffaa (MESOB) Bulchiinsa Magaalaa Shaggaritti Damee Buraayyuu.
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Official Address</p>
                  <p className="text-[#17221B] font-semibold mt-0.5">{address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Contact Desk</p>
                  <p className="text-[#17221B] font-semibold mt-0.5">{phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Official Email</p>
                  <p className="text-[#17221B] font-semibold mt-0.5">{email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 text-[#176B3A] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">Working Information</p>
                  <p className="text-[#17221B] font-semibold mt-0.5">{workingHours}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-neutral-100">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#176B3A] hover:bg-[#0F5132] px-6 py-3.5 text-xs font-bold uppercase text-white shadow-xs transition active:scale-[0.98]"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
