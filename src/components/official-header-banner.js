"use client";

import Image from "next/image";
import Link from "next/link";

export default function OfficialHeaderBanner() {
  return (
    <div className="w-full bg-white" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.10)" }}>

      {/* TOP DIAGONAL STRIPE - Abbaa Gadaa Red + Black */}
      <div className="relative h-5 w-full overflow-hidden" style={{ background: "#1a1a1a" }}>
        <div
          className="absolute inset-0"
          style={{
            background: "#CC1818",
            clipPath: "polygon(0 0, 78% 0, 68% 100%, 0 100%)",
          }}
        />
        <div
          className="absolute top-0 h-full w-3"
          style={{ left: "67%", transform: "skewX(-20deg)", background: "rgba(255,255,255,0.55)" }}
        />
      </div>

      {/* MAIN BANNER BODY */}
      <div style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "10px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>

        {/* LEFT: Burayu MESOB Logo */}
        <Link href="/" className="shrink-0 group">
          <div
            className="rounded-full overflow-hidden transition-transform duration-200 group-hover:scale-105"
            style={{ width: 80, height: 80, border: "3px solid #CC1818", background: "#fff", padding: 2 }}
          >
            <Image
              src="/images/burayu-mesob-logo.jpg"
              alt="Burayu MESOB Emblem"
              width={74}
              height={74}
              priority
              style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: "50%" }}
            />
          </div>
        </Link>

        {/* CENTER: Trilingual Official Title */}
        <div style={{ flex: 1, textAlign: "center", padding: "0 12px" }}>
          <p style={{ fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, fontSize: "clamp(11px, 2vw, 20px)", color: "#1a1a1a", letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1.25, margin: 0 }}>
            WIIRTUU TAJAAJILA TOKKOFFA(MESOB) BULCHIINSA
          </p>
          <p style={{ fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, fontSize: "clamp(11px, 2vw, 20px)", color: "#1a1a1a", letterSpacing: "0.03em", textTransform: "uppercase", lineHeight: 1.25, margin: 0 }}>
            MAGAALAA SHAGGARITTI DAMEE BURAAYYUU
          </p>
          <p style={{ fontFamily: "serif", fontWeight: 700, fontSize: "clamp(10px, 1.5vw, 16px)", color: "#1a1a1a", lineHeight: 1.3, marginTop: 3 }}>
            የሸገር ከተማ አስተዳደር አንደኛ የአገልግሎት ማዕከል (መሶብ) ቡራዩ ቅርንጫፍ
          </p>
          <p style={{ fontFamily: "Arial, sans-serif", fontWeight: 700, fontSize: "clamp(9px, 1.2vw, 13px)", color: "#1a1a1a", letterSpacing: "0.08em", textTransform: "uppercase", lineHeight: 1.3, marginTop: 4 }}>
            SHAGGAR CITY ADMINISTRATION FIRST SERVICE CENTER, BURAYU BRANCH
          </p>
        </div>

        {/* RIGHT: SHAGGAR Badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div
            className="rounded-full overflow-hidden"
            style={{ width: 64, height: 64, border: "3px solid #CC1818", background: "#fff", padding: 2 }}
          >
            <Image
              src="/images/burayu-mesob-logo.jpg"
              alt="SHAGGAR Emblem"
              width={58}
              height={58}
              style={{ objectFit: "contain", width: "100%", height: "100%", borderRadius: "50%" }}
            />
          </div>
          <span style={{ fontFamily: "Arial Black, Arial, sans-serif", fontWeight: 900, fontSize: "clamp(10px, 1.2vw, 14px)", color: "#CC1818", textTransform: "uppercase", letterSpacing: "0.15em" }}>
            SHAGGAR
          </span>
        </div>
      </div>

      {/* BOTTOM DOUBLE RED LINE DIVIDER */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px 8px" }}>
        <div style={{ height: 4, background: "#CC1818", borderRadius: 2 }} />
        <div style={{ height: 2, background: "#CC1818", borderRadius: 2, marginTop: 3, opacity: 0.5 }} />
      </div>
    </div>
  );
}
