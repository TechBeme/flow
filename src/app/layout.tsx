import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
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
    "Create AI images and cinematic videos with Google Cloud Vertex AI, Nano Banana, Omni, and Veo in one open-source workspace.",
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
      "Generate images and cinematic videos with Vertex AI, Nano Banana, Omni, and Veo.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Flow AI creative workspace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flow - Open-source AI image and video studio",
    description:
      "Generate images and cinematic videos with Vertex AI, Nano Banana, Omni, and Veo.",
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
    <html lang="pt-BR">
      <body className={`${dmSans.variable} antialiased bg-black`}>
        <TooltipProvider delayDuration={200}>
          {children}
        </TooltipProvider>
        <Toaster position="top-center" closeButton />
      </body>
    </html>
  );
}
