import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChefVision AI · Back-of-House CRM",
  description:
    "The ChefVision AI back-of-house workspace for supplier intelligence, invoice review, inventory health, and smart purchasing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans text-slate-800 antialiased">{children}</body>
    </html>
  );
}
