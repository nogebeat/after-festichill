import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Festichill Afterparty — Réserve ton pass",
  description: "Inscris-toi à l'afterparty Festichill et reçois ton pass QR par email.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
