import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
  centered = false,
  dark = false,
}) {
  return (
    <div
      className={`mb-12 flex flex-col gap-5 ${
        centered
          ? "items-center text-center"
          : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={`max-w-3xl relative ${centered ? "mx-auto text-center" : ""}`}>
        {eyebrow ? (
          <div className="mb-3">
            <span
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase ${
                dark
                  ? "bg-white/10 text-white border border-white/20 backdrop-blur-md"
                  : "bg-[#D71920]/10 text-[#D71920] border border-[#D71920]/25"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
              {eyebrow}
            </span>
          </div>
        ) : null}

        <h2
          className={`font-serif text-3xl sm:text-4xl lg:text-5xl font-normal sm:font-medium tracking-tight leading-[1.18] ${
            dark ? "text-white" : "text-[#070707]"
          }`}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={`mt-4 text-sm sm:text-base leading-relaxed font-normal ${
              centered ? "max-w-2xl mx-auto" : "max-w-2xl"
            } ${dark ? "text-neutral-300" : "text-neutral-600"}`}
          >
            {description}
          </p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={`group inline-flex shrink-0 items-center gap-2.5 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-lg hover-lift cursor-pointer ${
            dark
              ? "bg-white/10 hover:bg-white text-white hover:text-black border border-white/25 backdrop-blur-md"
              : "bg-white hover:bg-[#070707] text-[#070707] hover:text-white border-2 border-[#070707]"
          }`}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
