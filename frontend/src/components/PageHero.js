import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function PageHero({ eyebrow, title, description, primaryAction, secondaryAction, image }) {
  return (
    <section className="relative overflow-hidden bg-black text-white" style={{ borderBottom: "4px solid #FE0002" }}>
      <div className="absolute inset-0">
        {image && (
          <Image
            src={image}
            alt={title || "Page Hero"}
            fill
            priority
            sizes="100vw"
            quality={80}
            className="object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-red-950/70 z-10" />
      </div>

      <div className="container-shell relative z-20 py-16 sm:py-20">
        <div className="max-w-3xl">
          <div className="mb-2 h-1 w-12 rounded-full bg-[#FE0002]" />
          {eyebrow ? (
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#FE0002]">{eyebrow}</p>
          ) : null}
          <h1 className={`${eyebrow ? "mt-3" : "mt-2"} text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl`}>{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-300 font-medium">{description}</p>

          <div className="mt-8 flex flex-wrap gap-4">
            {primaryAction ? (
              primaryAction.external ? (
                <a
                  href={primaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FE0002] hover:bg-[#CC0002] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]"
                >
                  {primaryAction.label}
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link
                  href={primaryAction.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FE0002] hover:bg-[#CC0002] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]"
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
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-wider text-white transition-all duration-200 hover:bg-white/20 hover:shadow-md hover:-translate-y-[2px] active:translate-y-0 active:scale-[0.98]"
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
