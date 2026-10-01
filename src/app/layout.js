import "./globals.css";
import LayoutWrapper from "@/components/layout-wrapper";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { ToastProvider } from "@/src/context/ToastContext";
import { ThemeProvider } from "@/src/context/ThemeContext";

export const metadata = {
  title: {
    default: "Burayu MESOB — Official Web Portal",
    template: "%s | Burayu MESOB",
  },
  description:
    "Official digital information portal for Burayu MESOB, providing public services information, announcements, events, projects, investment opportunities, and e-service gateways.",
  keywords: [
    "Burayu MESOB",
    "Burayu",
    "Magaalaa Burraayyuu",
    "ቡራዩ",
    "Oromia",
    "Ethiopia",
    "Public Portal",
    "E-Service",
    "Municipal Services",
    "Investment",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="om" className="h-full">
      <body className="h-full antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ToastProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
            </ToastProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
