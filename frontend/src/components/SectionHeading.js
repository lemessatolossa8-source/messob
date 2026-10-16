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
    <div className={`mb-10 flex flex-col gap-4 ${centered ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className="max-w-2xl relative">
        {eyebrow ? (
          <p className={`text-xs font-bold uppercase tracking-[0.2em] ${dark ? "text-white/80" : "text-[#FE0002]"}`}>
            {eyebrow}
          </p>
        ) : null}
        <h2 className={`mt-1 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl ${dark ? "text-white" : "text-[#070707]"}`}>
          {title}
        </h2>
        <div className="h-1 w-12 bg-[#FE0002] mt-3 rounded-full"></div>
        {description ? (
          <p className={`mt-4 text-sm sm:text-base leading-relaxed ${dark ? "text-neutral-300" : "text-neutral-600"}`}>
            {description}
          </p>
        ) : null}
      </div>

      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className={`inline-flex shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wider transition ${dark ? "text-white hover:text-neutral-300" : "text-[#FE0002] hover:text-[#CC0002]"}`}
        >
          <span>{actionLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
