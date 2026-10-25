import "./globals.css";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { cache } from "react";
import LayoutWrapper from "@/components/LayoutWrapper";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { ThemeProvider } from "@/src/context/ThemeContext";
import { SiteSettingsProvider } from "@/src/context/SiteSettingsContext";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
  adjustFontFallback: true,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
  adjustFontFallback: true,
});

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.BACKEND_URL ? `${process.env.BACKEND_URL.replace(/\/+$/, "").replace(/\/api$/, "")}/api` : null) ||
  "http://127.0.0.1:5000/api";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const viewport = {
  themeColor: "#070707",
  width: "device-width",
  initialScale: 1,
};

// Deduplicate settings fetch across generateMetadata and RootLayout per request
const loadPublicSettings = cache(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/settings/public`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
});

export async function generateMetadata() {
  const settings = await loadPublicSettings();
  const defaultTitle = "Burayu MESOB — Official Web Portal";
  const defaultDesc =
    "Official digital information portal for Burayu MESOB, providing public services information, announcements, events, projects, investment opportunities, and e-service gateways.";

  if (!settings) {
    return {
      metadataBase: new URL(SITE_URL),
      title: {
        default: defaultTitle,
        template: "%s | Burayu MESOB",
      },
      description: defaultDesc,
      alternates: {
        canonical: "/",
      },
      icons: {
        icon: "/favicon.ico",
        apple: "/images/burayu-mesob-logo.png",
      },
    };
  }

  const title = settings.siteName?.en || settings.siteName?.om || "Burayu MESOB";
  const description =
    settings.siteDescription?.en ||
    settings.siteTagline?.en ||
    defaultDesc;
  const keywords = settings.seo?.keywords
    ? String(settings.seo.keywords)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${title} — Official Web Portal`,
      template: `%s | ${title}`,
    },
    description,
    keywords,
    authors: settings.seo?.author ? [{ name: settings.seo.author }] : undefined,
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/images/burayu-mesob-logo.png",
    },
    openGraph: {
      title,
      description,
      images: settings.seo?.ogImage ? [settings.seo.ogImage] : ["/images/burayu-mesob-logo.png"],
    },
  };
}

export default async function RootLayout({ children }) {
  const settings = await loadPublicSettings();
  const defaultLang = settings?.languageSettings?.defaultLanguage || "om";

  return (
    <html lang={defaultLang} className="h-full" data-scroll-behavior="smooth">
      <body className={`h-full antialiased ${playfair.variable} ${plusJakarta.variable}`}>
        <ThemeProvider>
          <SiteSettingsProvider initialSettings={settings}>
            <LanguageProvider>
              <ToastProvider>
                <LayoutWrapper>{children}</LayoutWrapper>
              </ToastProvider>
            </LanguageProvider>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
