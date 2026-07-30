import QrScanner from "@/components/QrScanner";

export const metadata = {
  title: "Contrôle d'accès — Festichill Afterparty",
};

export default function ScanPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start px-6 py-12 overflow-hidden">
      <div className="event-bg" />
      <div className="event-bg-overlay" />
      <div className="grain" />

      <div className="relative z-10 w-full">
        <QrScanner />
      </div>
    </main>
  );
}
