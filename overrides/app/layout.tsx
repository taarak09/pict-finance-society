import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "PICT Finance Society | Think Beyond the Numbers",
  description: "A student-led community at PICT Pune exploring finance, markets, research and ideas through collaboration and contribution.",
  applicationName: "PICT Finance Society",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
