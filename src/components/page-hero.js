import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function PageHero({ eyebrow, title, description, primaryAction, secondaryAction, image }) {
  return (
    <section className="relative overflow-hidden bg-[#141413] text-white" style={{ borderBottom: "4px solid #B9181C" }}>
      <div className="absolute inset-0">
        {image && (
          <img src={image} alt={title} className="h-full w-full object-cover opacity-25" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141413] via-[#141413]/90 to-red-950/70" />
      </div>

      <div className="container-shell relative py-16 sm:py-20">
        <div className="max-w-3xl">
          <div className="mb-2 h-1 w-12 rounded-full bg-[#B9181C]" />
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#B9181C]">{eyebrow}</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 font-medium">{description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            {primaryAction ? (
              primaryAction.external ? (
                <a
                  href={primaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#B9181C] hover:bg-[#8F1216] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition shadow-md active:scale-[0.98]"
                >
                  {primaryAction.label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[#B9181C] hover:bg-[#8F1216] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition shadow-md active:scale-[0.98]"
                >
                  {primaryAction.label}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )
            ) : null}

            {secondaryAction ? (
              <a
                href={secondaryAction.href}
                target={secondaryAction.external ? "_blank" : undefined}
                rel={secondaryAction.external ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-white/20 active:scale-[0.98]"
              >
                {secondaryAction.label}
                {secondaryAction.external ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
