import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#070F1A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Digital Menu — Quality Airport Hotel, Nedumbassery",
  description:
    "Explore the digital menu for The Landing (All-Day Dining) and The Cheers (Premium Bar) at Quality Airport Hotel, Cochin International Airport. Kerala specialities, tandoor, continental fare, premium spirits & more.",
  keywords: [
    "Quality Airport Hotel",
    "Nedumbassery",
    "Cochin Airport Hotel",
    "Digital Menu",
    "The Landing Restaurant",
    "The Cheers Bar",
    "Kerala Food",
    "Airport Dining",
  ],
  openGraph: {
    title: "Digital Menu — Quality Airport Hotel",
    description:
      "The Landing (All-Day Dining) & The Cheers (Premium Bar) — Browse our full menu, search dishes, and order via WhatsApp.",
    siteName: "Quality Airport Hotel",
    type: "website",
    locale: "en_IN",
  },
  appleWebApp: {
    capable: true,
    title: "QAH Menu",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
