import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function PageHero({ eyebrow, title, description, primaryAction, secondaryAction, image }) {
  return (
    <section className="relative overflow-hidden bg-black text-white" style={{ borderBottom: "4px solid #D71920" }}>
      <div className="absolute inset-0">
        {image && (
          <Image
            src={image}
            alt={title || "Page Hero"}
            fill
            priority
            sizes="100vw"
            quality={75}
            className="object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-red-950/70 z-10" />
      </div>

      <div className="container-shell relative z-20 py-16 sm:py-20">
        <div className="max-w-3xl">
          {eyebrow ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-black/45 backdrop-blur-md text-[11px] font-semibold tracking-[0.18em] uppercase text-white/95 mb-4 shadow-lg shadow-black/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D71920] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D71920]"></span>
              </span>
              <span>{eyebrow}</span>
            </div>
          ) : (
            <div className="mb-2 h-1 w-12 rounded-full bg-[#D71920]" />
          )}
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal sm:font-medium tracking-tight text-white leading-tight">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 font-medium">{description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            {primaryAction ? (
              primaryAction.external ? (
                <a
                  href={primaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#D71920] hover:bg-[#b5141a] px-7 py-3 text-sm font-bold tracking-wider text-white transition-all duration-300 shadow-xl shadow-red-950/40 hover-lift active:scale-[0.98] cursor-pointer"
                >
                  <span>{primaryAction.label}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#D71920] hover:bg-[#b5141a] px-7 py-3 text-sm font-bold tracking-wider text-white transition-all duration-300 shadow-xl shadow-red-950/40 hover-lift active:scale-[0.98] cursor-pointer"
                >
                  <span>{primaryAction.label}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )
            ) : null}

            {secondaryAction ? (
              <a
                href={secondaryAction.href}
                target={secondaryAction.external ? "_blank" : undefined}
                rel={secondaryAction.external ? "noreferrer" : undefined}
                className="inline-flex items-center gap-2.5 rounded-full border-2 border-white/80 hover:border-white hover:bg-white/15 px-7 py-3 text-sm font-bold tracking-wider text-white transition-all duration-300 backdrop-blur-sm hover-lift active:scale-[0.98] cursor-pointer"
              >
                <span>{secondaryAction.label}</span>
                {secondaryAction.external ? <ExternalLink className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
