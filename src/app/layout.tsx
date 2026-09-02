import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://flow.techbe.me"),
  title: {
    default: "Flow - Open-source AI image and video studio",
    template: "%s | Flow",
  },
  description:
    "Create AI images and cinematic videos through APIs in one open-source workspace, with support for Nano Banana, Omni, and Veo.",
  applicationName: "Flow",
  keywords: [
    "AI image generator",
    "AI video generator",
    "Vertex AI",
    "Google Gemini",
    "Nano Banana",
    "Veo 3.1",
    "Omni",
    "generative AI",
    "open source",
  ],
  authors: [{ name: "TechBeme", url: "https://github.com/TechBeme" }],
  creator: "TechBeme",
  publisher: "TechBeme",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Flow",
    title: "Flow - Open-source AI image and video studio",
    description:
      "Generate AI images and cinematic videos through APIs in one open-source creative workspace.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Flow AI creative workspace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flow - Open-source AI image and video studio",
    description:
      "Generate AI images and cinematic videos through APIs in one open-source creative workspace.",
    images: ["/og-image.png"],
  },
  category: "technology",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.variable} antialiased bg-black`}>
        <I18nProvider>
          <TooltipProvider delayDuration={200}>
            {children}
          </TooltipProvider>
          <Toaster position="top-center" closeButton />
        </I18nProvider>
      </body>
    </html>
  );
}
