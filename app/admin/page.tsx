import AdminPendingList from "./AdminPendingList";

export const metadata = {
  title: "Validation des demandes — Festichill Afterparty",
};

// ⚠️ Cette page n'a pas encore d'authentification : n'importe qui connaissant
// l'URL /admin peut y accéder. À protéger avant la mise en prod (middleware
// de session, mot de passe partagé, etc.).
export default function AdminPage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center px-6 py-16 overflow-hidden">
      <div className="event-bg" />
      <div className="event-bg-overlay" />
      <div className="grain" />

      <div className="relative z-10 w-full max-w-[720px]">
        <div className="text-center mb-10">
          <p className="font-display text-[14px] tracking-[0.35em] text-[var(--gold)] mb-1">
            Backoffice
          </p>
          <h1 className="font-display text-[48px] leading-[0.9] text-[var(--ink)]">
            Demandes en attente
          </h1>
        </div>

        <AdminPendingList />
      </div>
    </main>
  );
}
