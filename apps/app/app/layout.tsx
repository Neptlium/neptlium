import React from "react";
import type { Metadata } from "next";
import "./global.css";

export const metadata: Metadata = {
  title: "Neptlium | Institutional Capital Operating System",
  description: "Institutional capital operations platform"
};

export default function RootLayout({
  children
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
