import type { Metadata, Viewport } from "next";
import "@/index.css";

export const metadata: Metadata = {
  title: "AetherPM",
  description: "Engineering project management — general PM plus systems-engineering/SysML tooling.",
};

// Missing viewport meta is the #1 cause of "not responsive on Android":
// without it, mobile Chrome renders the page at a ~980px desktop-width
// viewport and shrinks the whole thing down, making everything tiny
// and requiring pinch-zoom instead of actually reflowing.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
