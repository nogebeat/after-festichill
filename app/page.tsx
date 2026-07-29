import TicketForm from "@/components/TicketForm";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
      <div className="grain" />

      {/* ambient glow */}
      <div
        className="glow-pulse absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,97,0.15) 0%, rgba(111,31,43,0.08) 45%, transparent 70%)",
        }}
      />

      <div className="relative z-10 rise text-center mb-10">
        <p className="font-display text-[14px] tracking-[0.5em] text-[var(--gold)] uppercase mb-3">
          Festichill présente
        </p>
        <h1 className="font-display text-[64px] sm:text-[88px] leading-[0.85] text-[var(--ink)]">
          AFTER
          <br />
          PARTY
        </h1>
        <p className="text-[15px] text-[var(--muted)] mt-4 max-w-[320px] mx-auto">
          La nuit continue. Inscris-toi, on t&apos;envoie ton pass avec le lieu et l&apos;heure.
        </p>
      </div>

      <div className="relative z-10 rise" style={{ animationDelay: "0.15s" }}>
        <TicketForm />
      </div>

      <p className="relative z-10 text-[11px] text-[var(--muted)] mt-10 tracking-wide">
        Places limitées — un pass par personne
      </p>
    </main>
  );
}
