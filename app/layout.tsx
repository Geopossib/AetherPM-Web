import type { Metadata } from "next";
import "@/index.css";

export const metadata: Metadata = {
  title: "AetherPM",
  description: "Engineering project management — general PM plus systems-engineering/SysML tooling.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
