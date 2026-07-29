import TicketForm from "@/components/TicketForm";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      {/* event photo background, fixed behind everything */}
      <div className="event-bg" />
      <div className="event-bg-overlay" />
      <div className="grain" />

      {/* ambient glow */}
      <div
        className="glow-pulse absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,97,0.18) 0%, rgba(111,31,43,0.1) 45%, transparent 70%)",
        }}
      />

      <div className="relative z-10 rise text-center mb-10">
        <p className="font-display text-[15px] tracking-[0.5em] text-[var(--gold)] mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]">
          Festichill présente
        </p>
        <h1 className="font-display text-[76px] sm:text-[104px] leading-[0.82] text-[var(--ink)] drop-shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
          AFTER
          <br />
          PARTY
        </h1>
        <p className="text-[15px] text-[var(--muted)] mt-5 max-w-[320px] mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          La nuit continue. Inscris-toi, on t&apos;envoie ton pass avec le lieu et l&apos;heure.
        </p>
      </div>

      <div className="relative z-10 rise" style={{ animationDelay: "0.15s" }}>
        <TicketForm />
      </div>

      <p className="relative z-10 text-[11px] text-[var(--muted)] mt-10 tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
        Places limitées — un pass par personne
      </p>
    </main>
  );
}
